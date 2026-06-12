# ColorMe 실행 & 테스트 가이드 (캡스톤 시연용)

AI 퍼스널 컬러 진단 + 가상 피팅 서비스를 로컬에서 실행하고 시연하는 방법.

## 1. 사전 준비

| 항목 | 버전/비고 |
|------|-----------|
| Node.js | 20.x |
| pnpm | `npm i -g pnpm` |
| Docker Desktop | 인프라 컨테이너 실행용 |
| Gemini API 키 | [Google AI Studio](https://aistudio.google.com/apikey)에서 무료 발급 |

```bash
pnpm install
```

## 2. 인프라 실행 (Docker)

MySQL(Galera) / Redis / RabbitMQ / MinIO 컨테이너가 필요하다.
`tools/docker-compose/` 하위 각 디렉토리에서 실행한다. (이미 실행 중이면 생략)

```bash
docker ps   # drvalue_bmes_db1~3, rabbitmq1~3, minio1~4, redis-node 확인
```

## 3. 환경 변수

루트 `.env` 파일 사용 (Doppler 불필요). **딱 하나만 채우면 된다:**

```bash
GEMINI_API_KEY="발급받은_키"        # 비어있으면 분석/가상피팅이 FAILED 처리됨
```

선택 설정:

```bash
GEMINI_ANALYSIS_MODEL="gemini-2.5-flash"            # 분석 모델 (무료 티어 가능)
PC_TRYON_PROVIDER="OPENAI"                          # 가상 피팅 프로바이더 (GEMINI | OPENAI)
OPENAI_API_KEY="..."                                # PC_TRYON_PROVIDER=OPENAI 일 때 필요
OPENAI_IMAGE_MODEL="gpt-image-1"                    # 기본값
GEMINI_IMAGE_MODEL="gemini-2.5-flash-image"         # PC_TRYON_PROVIDER=GEMINI 일 때 사용
NEXT_PUBLIC_GATEWAY_ORIGIN="http://localhost:3300"  # 프론트가 호출할 게이트웨이 주소
```

> ⚠️ Gemini **이미지 생성** 모델은 무료 티어 쿼터가 0이라 결제 등록 없이는 429가 난다.
> 분석(텍스트)은 무료로 동작하므로, 가상 피팅만 OpenAI(gpt-image)로 돌리는 구성을 기본으로 한다.

## 4. 시드 데이터 (최초 1회)

시즌 마스터 4종(팔레트 포함) + 브랜드 의상 카탈로그 24종(실사 이미지)을 넣는다.
테이블은 서비스 첫 기동 시 TypeORM `synchronize`로 자동 생성되므로, **서비스를 한 번 띄운 뒤** 실행한다.

```bash
pnpm seed:personal-color
```

멱등 스크립트라 여러 번 실행해도 안전하다.

## 5. 서비스 실행 (터미널 5개)

```bash
pnpm serve:auth             # :3301
pnpm serve:file-mng         # :3302
pnpm serve:personal-color   # :3305
pnpm serve:gateway          # :3300 (프론트가 호출하는 단일 진입점)
pnpm serve:web              # :3000 (Next.js)
```

## 6. 시연 시나리오

1. `http://localhost:3000` 접속 → 랜딩 페이지
2. **진단 시작** → 스타일 선호 선택 (`/analysis/style`)
3. 얼굴 사진 업로드 또는 카메라 촬영 (`/analysis/upload`) — 클라이언트 품질 검사 통과 필요
4. 선호도 반영 여부 선택 (`/analysis/preference`)
5. **결과 페이지** (`/analysis/result`)
   - 업로드 → Gemini 분석 자동 시작, 완료까지 폴링 (수 초~1분)
   - 시즌 판정 + 신뢰도 + 추천 팔레트 + 시즌별 점수 그래프
   - 시즌/성별/팔레트 매칭으로 걸러진 **브랜드 의상 추천** (상의/하의/액세서리)
6. 상의 + 하의(+액세서리) 선택 → **가상 피팅 시작**
   - Gemini 이미지 생성으로 본인 사진에 의상 합성 (1~2분)
7. 룩 **저장**(메모) / **공유 링크 복사** → `http://localhost:3000/share/<토큰>` 새 창에서 확인
8. 부적합한 사진(어두움/측면)을 올리면 FAILED + 재촬영 가이드가 표시되는 것도 시연 포인트

## 7. API 단독 테스트 (curl)

Swagger: `http://localhost:3300/api/serv/personal-color/docs` (auth/file-mng도 동일 패턴)

```bash
BASE=http://localhost:3300/api/serv/personal-color/v1/personal-color/default

# 1) 업로드 → sessionToken + analysisId
curl -X POST $BASE/analyze/upload -F "photo=@face.jpg"

# 2) 분석 결과 폴링 (ANALYZING → COMPLETED/FAILED)
curl $BASE/analyze/<analysisId> -H "x-pc-session-token: <sessionToken>"

# 3) 가상 피팅 (itemId는 2번 응답의 recommendations에서)
curl -X POST $BASE/looks/try-on -H "x-pc-session-token: <sessionToken>" \
  -H "Content-Type: application/json" \
  -d '{"analysisId":1,"topItemId":39,"bottomItemId":51}'

# 4) 피팅 결과 폴링 (TRYON_PENDING → TRYON_COMPLETED)
curl $BASE/looks/<lookId> -H "x-pc-session-token: <sessionToken>"

# 5) 저장 / 공유
curl -X POST $BASE/looks/<lookId>/save  -H "x-pc-session-token: <sessionToken>" \
  -H "Content-Type: application/json" -d '{"description":"데일리 룩"}'
curl -X POST $BASE/looks/<lookId>/share -H "x-pc-session-token: <sessionToken>"
curl $BASE/share/<shareToken>   # 인증 불필요 (공유 페이지가 사용)
```

## 8. 알려진 제약 / 트러블슈팅

| 증상 | 원인/해결 |
|------|----------|
| 분석이 항상 FAILED | `GEMINI_API_KEY` 미설정. `.env` 채우고 personal-color 서비스 재시작 |
| 가상 피팅만 FAILED | Gemini 무료 키는 이미지 생성 쿼터 0 (429) → `PC_TRYON_PROVIDER="OPENAI"` + OpenAI 키 사용, 또는 Google 결제 등록 |
| 업로드 직후 이미지 404 | 저장 직후 짧은 반영 지연. 프론트가 자동 재시도하므로 잠시 대기 |
| 추천 의상 이미지 전부 깨짐 (504) | 코드 수정 후 watch 재빌드 중 서비스가 죽는 경우 있음. `lsof -i :3302`로 확인 후 해당 서비스 재시작 |
| 서비스 기동 실패 | Docker 인프라(MySQL/Redis/RabbitMQ/MinIO) 기동 여부 확인 |
| 로그인 실패 | 회원가입 먼저 필요 (DB 저장 실인증). 비밀번호: 8자+영문+숫자+특수문자 |

## 9. 아키텍처 요약

```
Next.js(:3000) ──> Gateway(:3300, /api/serv/*) ──┬─> service-auth(:3301)
                                                 ├─> service-file-mng(:3302) ── MinIO
                                                 └─> service-personal-color(:3305) ── Gemini API
                                                          │
                                              MySQL(Galera) · RabbitMQ · Redis
```

- 인증: 세션 토큰(`x-pc-session-token`) 기반. 게스트로 전체 플로우 사용 가능하며,
  회원가입(`POST /auth/signup`, bcrypt 해시 저장) 시 게스트 분석 이력이 계정으로 승계됨.
  로그인(`POST /auth/login`)은 토큰을 재발급(회전)함. 프로필 조회는 `GET /auth/me`.
- 분석/피팅 모두 **비동기 처리 + 폴링** 패턴 (업로드 즉시 응답 → 백그라운드 Gemini 호출)
- 의상 추천: Gemini가 판정한 시즌/성별 + 팔레트 색상 거리 + 스타일 태그 매칭 점수 기반
