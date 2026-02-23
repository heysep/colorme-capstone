#!/usr/bin/env bash
set -euo pipefail

INIT_FLAG="/usr/share/elasticsearch/data/.initialized"   # data 볼륨에 플래그 저장
ES_HOST="http://localhost:9200"

log(){ echo "$(date '+%Y-%m-%d %H:%M:%S') - $*"; }

install_plugins(){
  local csv="${INSTALL_PLUGINS:-analysis-nori,analysis-smartcn,analysis-icu}"
  IFS=',' read -r -a arr <<< "$csv"
  for p in "${arr[@]}"; do
    p="$(echo "$p" | xargs)"
    if /usr/share/elasticsearch/bin/elasticsearch-plugin list | grep -qx "$p"; then
      log "플러그인 이미 설치됨: $p (건너뜀)"
    else
      log "플러그인 설치: $p"
      /usr/share/elasticsearch/bin/elasticsearch-plugin install --batch "$p"
    fi
  done
}

wait_until_ready(){
  log "Elasticsearch 준비 대기..."
  # 보안 활성화 상태에서 기본 크리덴셜 필요
  until curl -s -u "elastic:${ELASTIC_PASSWORD}" "${ES_HOST}" >/dev/null; do sleep 1; done
  curl -s -u "elastic:${ELASTIC_PASSWORD}" \
    "${ES_HOST}/_cluster/health?wait_for_status=yellow&timeout=60s" >/dev/null || true
  log "Elasticsearch 응답 OK"
}

put_template(){
  local file="${ES_TEMPLATE_FILE:-/usr/share/elasticsearch/config/chat_messages_template.json}"
  log "인덱스 템플릿 업서트: chat-msg-template"
  # ES 7.x legacy template API
  local resp
  resp=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" -X PUT \
    "${ES_HOST}/_index_template/chat-msg-template" \
    -H "Content-Type: application/json" \
    --data-binary "@${file}")
  echo "$resp" | grep -q '"acknowledged":true' || {
    log "템플릿 업서트 실패: $resp"; exit 1;
  }
}

create_index_if_absent(){
  local name="${ES_INDEX_NAME:-chat-msg-test}"
  local code
  code=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" -o /dev/null -w "%{http_code}" -X HEAD "${ES_HOST}/${name}")
  if [[ "$code" == "200" ]]; then
    log "인덱스 존재: ${name} (건너뜀)"
  else
    log "인덱스 생성: ${name}"
    # 템플릿이 적용되도록 빈 바디로 생성
    local resp
    resp=$(curl -s -u "elastic:${ELASTIC_PASSWORD}" -X PUT \
      "${ES_HOST}/${name}" \
      -H "Content-Type: application/json" \
      -d '{}')
    echo "$resp" | grep -q '"acknowledged":true' || {
      log "인덱스 생성 실패: $resp"; exit 1;
    }
  fi
}

# ─────────────────────────────────────────────────────────

# 플러그인은 항상 점검 (이미 설치시 건너뜀)
log "플러그인 점검/설치 시작..."
install_plugins

if [[ -f "$INIT_FLAG" ]]; then
  log "초기화 플래그 발견. Elasticsearch 바로 실행."
  /usr/local/bin/docker-entrypoint.sh &
else
  log "Elasticsearch 시작..."
  /usr/local/bin/docker-entrypoint.sh &

  wait_until_ready
  put_template
  create_index_if_absent

  log "초기화 완료 플래그 생성"
  touch "$INIT_FLAG"
fi

wait
