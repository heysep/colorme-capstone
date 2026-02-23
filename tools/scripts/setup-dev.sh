#!/bin/bash

set -e  # 오류 발생 시 스크립트 종료
set -o pipefail  # 파이프라인에서 오류 발생 시 스크립트 종료

# ================== 디버그 옵션 (환경변수로 활성화) ==================
if [[ -n "${SETUP_DEBUG:-}" ]]; then
    set -x
fi

# ================== 설정 파일 경로 ==================
CONFIG_DIR="$HOME/.config/smart-bmes"
CONFIG_FILE="$CONFIG_DIR/setup-config"

# ================== 아스키 아트 및 환영 메시지 ==================
print_welcome() {
    # ---------------- 색상 시작 ----------------
    echo -e "\e[32m"

    # ---------------- 안내 문구 ----------------
    echo "Welcome to the Smart Auto-Discovery Docker Environment Setup!"
    echo "This script automatically detects all available services."
    echo ""
    echo "Copyright (c) 2025 SIHUN CHOI. All rights reserved."
    echo ""

    # ---------------- GrowXD 로고 ----------------
    
         cat << "EOF"
 ██████╗ ██████╗  ██████╗ ██╗    ██╗   ██╗  ██╗ ██████╗ 
██╔════╝ ██╔══██╗██╔═══██╗██║    ██║   ╚██╗██╔╝ ██╔══██╗
██║  ███╗██████╔╝██║   ██║██║ █╗ ██║    ╚███╔╝  ██║  ██║
██║   ██║██╔══██╗██║   ██║██║███╗██║    ██╔██╗  ██║  ██║
╚██████╔╝██║  ██║╚██████╔╝╚███╔███╔╝   ██╔╝ ██╗ ██████╔╝
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝    ╚═╝  ╚═╝ ╚═════╝ 

🤖  자동 서비스 인식 & Docker 환경 설정 스크립트
⚡  하드코딩 NO! 똑똑한 자동 감지 YES! ⚡
EOF

    # ---------------- 색상 끝 ----------------
    echo -e "\e[0m"
}
# ================== 로그 출력 함수 ==================
log() {
    local level="$1"
    local message="$2"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local pid="$$"
    echo "[$timestamp] [$level] [PID: $pid] $message"
}

# ================== 설정 파일 관리 함수 ==================
create_config_dir() {
    if [[ ! -d "$CONFIG_DIR" ]]; then
        mkdir -p "$CONFIG_DIR"
        chmod 700 "$CONFIG_DIR"
        log "INFO" "설정 디렉토리 생성: $CONFIG_DIR"
    fi
}

save_config() {
    local doppler_token="$1"
    local app_root_path="$2"
    local excluded_services="$3"
    
    create_config_dir
    
    cat > "$CONFIG_FILE" << EOF
# Smart ERP Auto-Discovery Docker Setup Configuration
# 생성일: $(date)
DOPPLER_TOKEN_CUSTOM="$doppler_token"
APP_ROOT_PATH="$app_root_path"
EXCLUDED_SERVICES="$excluded_services"
EOF
    
    chmod 600 "$CONFIG_FILE"
    log "INFO" "설정이 저장되었습니다: $CONFIG_FILE"
}

load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE"
        log "INFO" "저장된 설정을 불러왔습니다"
        return 0
    else
        log "INFO" "저장된 설정이 없습니다. 새로 입력받습니다."
        return 1
    fi
}

# ================== 자동 서비스 감지 함수들 ==================

# Docker Compose 디렉토리 기반 서비스 감지
discover_services_from_compose() {
    local compose_root="$1"
    local services=()
    
    log "INFO" "Docker Compose 디렉토리에서 서비스 자동 감지 중: $compose_root"
    
    if [[ ! -d "$compose_root" ]]; then
        log "ERROR" "Docker Compose 디렉토리가 존재하지 않습니다: $compose_root"
        return 1
    fi
    
    # docker-compose.yaml 파일이 있는 디렉토리들 찾기
    while IFS= read -r -d '' dir; do
        local service_name
        service_name=$(basename "$dir")
        
        # docker-compose.yaml 파일 존재 확인
        if [[ -f "$dir/docker-compose.yaml" ]]; then
            services+=("$service_name")
            log "DEBUG" "발견된 서비스: $service_name"
        fi
    done < <(find "$compose_root" -maxdepth 1 -type d -not -path "$compose_root" -print0)
    
    # 서비스 목록을 알파벳 순으로 정렬
    IFS=$'\n' sorted_services=($(sort <<<"${services[*]}"))
    unset IFS
    
    log "INFO" "총 ${#sorted_services[@]}개의 서비스를 발견했습니다"
    printf -v DISCOVERED_SERVICES_STR '%s ' "${sorted_services[@]}"
    export DISCOVERED_SERVICES=("${sorted_services[@]}")
    
    return 0
}

# 서비스 분류 함수 (Infrastructure vs Application)
classify_services() {
    local -n all_services=$1
    local -n infra_services=$2
    local -n app_services=$3
    
    # Infrastructure 서비스 패턴
    local infra_patterns=("drvalue-bmes-mysql" "drvalue-bmes-minio" "drvalue-bmes-redis" "drvalue-bmes-es" "drvalue-bmes-rabbitmq")
    
    for service in "${all_services[@]}"; do
        local is_infra=false
        
        for pattern in "${infra_patterns[@]}"; do
            if [[ "$service" == "$pattern" ]]; then
                infra_services+=("$service")
                is_infra=true
                break
            fi
        done
        
        if [[ "$is_infra" == false ]]; then
            app_services+=("$service")
        fi
    done
    
    log "INFO" "Infrastructure 서비스: ${#infra_services[@]}개"
    log "INFO" "Application 서비스: ${#app_services[@]}개"
}

# 컨테이너 이름 자동 감지
discover_container_names() {
    local compose_file="$1"
    local container_names=()
    
    if [[ -f "$compose_file" ]]; then
        # docker-compose.yaml에서 container_name 추출
        while IFS= read -r line; do
            if [[ "$line" =~ container_name:[[:space:]]*(.+) ]]; then
                local container_name="${BASH_REMATCH[1]}"
                # 따옴표 제거
                container_name=$(echo "$container_name" | sed 's/["'"'"']//g')
                container_names+=("$container_name")
            fi
        done < "$compose_file"
    fi
    
    printf '%s\n' "${container_names[@]}"
}

# 모든 컨테이너 이름 수집
# collect_all_container_names() {
#     local compose_root="$1"
#     local all_containers=()
    
#     for service in "${DISCOVERED_SERVICES[@]}"; do
#         local compose_file="$compose_root/$service/docker-compose.yaml"
#         if [[ -f "$compose_file" ]]; then
#             while IFS= read -r container_name; do
#                 if [[ -n "$container_name" ]]; then
#                     all_containers+=("$container_name")
#                 fi
#             done < <(discover_container_names "$compose_file")
#         fi
#     done
    
#     export DISCOVERED_CONTAINERS=("${all_containers[@]}")
#     log "INFO" "총 ${#all_containers[@]}개의 컨테이너 이름을 수집했습니다"
# }

# 이미지 이름 패턴 자동 감지 (cleanup_service_images에서 사용)
discover_service_images() {
    local compose_root="$1"
    local app_services=("${DISCOVERED_APP_SERVICES[@]}")
    local image_patterns=()
    
    for service in "${app_services[@]}"; do
        # 컨테이너 이름 기반 이미지 패턴 생성
        local compose_file="$compose_root/$service/docker-compose.yaml"
        if [[ -f "$compose_file" ]]; then
            # 실제 컨테이너 이름들 추출
            while IFS= read -r container_name; do
                if [[ -n "$container_name" ]]; then
                    # 컨테이너 이름 기반 이미지 패턴
                    local patterns=(
                        "${container_name}-*"
                        "*-${container_name}"
                        "${container_name}:*"
                        "*${container_name}*"
                        # 서비스 이름 기반 패턴도 유지
                        "${service}-*"
                        "*-${service}"
                    )
                    image_patterns+=("${patterns[@]}")
                fi
            done < <(discover_container_names "$compose_file")
        fi
        
        # 기본 서비스 이름 패턴도 추가
        local basic_patterns=(
            "${service}:*"
            "*${service}*"
        )
        image_patterns+=("${basic_patterns[@]}")
    done
    
    # 중복 제거
    IFS=$'\n' unique_patterns=($(printf '%s\n' "${image_patterns[@]}" | sort | uniq))
    unset IFS
    
    export DISCOVERED_IMAGE_PATTERNS=("${unique_patterns[@]}")
    log "INFO" "이미지 정리를 위한 ${#unique_patterns[@]}개의 패턴을 생성했습니다"
}

# ================== 환경 변수 설정 ==================
set_environment_variable() {
    INPUT_VALUE="##INPUT_VALUE##"
    export DOPPLER_TOKEN_CUSTOM="$INPUT_VALUE"
    export APP_ROOT_PATH="$INPUT_VALUE"
    export EXCLUDED_SERVICES=""
    
    # 저장된 설정 로드 시도
    if load_config; then
        echo ""
        echo "📋 현재 저장된 설정:"
        echo "• Doppler 토큰: ${DOPPLER_TOKEN_CUSTOM:0:8}..."
        echo "• 앱 루트 경로: $APP_ROOT_PATH"
        if [[ -n "${EXCLUDED_SERVICES:-}" ]]; then
            echo "• 제외된 서비스: $EXCLUDED_SERVICES"
        else
            echo "• 제외된 서비스: 없음"
        fi
        echo ""
        
        read -p "[+] 저장된 설정을 사용하시겠습니까? (y/n/r): " config_choice
        echo "    y: 저장된 설정 사용"
        echo "    n: 새로운 설정 입력"  
        echo "    r: 저장된 설정 삭제 후 새로 입력"
        echo ""
        
        case "$config_choice" in
            "y"|"Y"|"")
                log "INFO" "저장된 설정을 사용합니다"
                ;;
            "r"|"R")
                if [[ -f "$CONFIG_FILE" ]]; then
                    rm -f "$CONFIG_FILE"
                    log "INFO" "저장된 설정이 삭제되었습니다"
                fi
                set_environment_variable
                return
                ;;
            "n"|"N")
                # 새로 입력받기
                ;;
            *)
                log "WARN" "잘못된 선택입니다. 저장된 설정을 사용합니다."
                return
                ;;
        esac
    fi
    
    # 새로운 설정 입력
    if [[ "$DOPPLER_TOKEN_CUSTOM" == "$INPUT_VALUE" || "$config_choice" == "n" || "$config_choice" == "N" ]]; then
        echo ""
        echo "🔧 새로운 환경 설정을 입력해주세요:"
        
        read -p "[+] Doppler 토큰을 입력하세요: " new_doppler_token
        read -p "[+] 앱 루트 경로를 입력하세요: " new_app_root_path
        
        export DOPPLER_TOKEN_CUSTOM="$new_doppler_token"
        export APP_ROOT_PATH="$new_app_root_path"
        export EXCLUDED_SERVICES=""
        
        read -p "[+] 이 설정을 저장하시겠습니까? (y/n): " save_choice
        if [[ "$save_choice" == "y" || "$save_choice" == "Y" || "$save_choice" == "" ]]; then
            save_config "$DOPPLER_TOKEN_CUSTOM" "$APP_ROOT_PATH" ""
            echo "✅ 다음 실행부터는 저장된 설정이 자동으로 사용됩니다!"
        fi
    fi
    
    # 경로 설정
    DOCKER_COMPOSE_COMMAND="docker compose"
    if [[ -n "${SETUP_DEBUG:-}" ]]; then
        DOCKER_COMPOSE_COMMAND="docker --log-level debug compose"
    fi
    DOCKER_COMPOSE_FILE_ROOT_PATH="${APP_ROOT_PATH}/tools/docker-compose"
    NX_PROJECT_ROOT_PATH="${APP_ROOT_PATH}"
    
    log "INFO" "환경 변수 설정 완료"
}

# ================== 자동 감지 및 검증 ==================
auto_discover_and_validate() {
    log "INFO" "🤖 자동 서비스 감지를 시작합니다..."
    
    # 1. Docker Compose 디렉토리에서 서비스 감지
    if ! discover_services_from_compose "$DOCKER_COMPOSE_FILE_ROOT_PATH"; then
        log "ERROR" "서비스 자동 감지에 실패했습니다"
        exit 1
    fi
    
    # 2. 서비스 분류
    DISCOVERED_INFRA_SERVICES=()
    DISCOVERED_APP_SERVICES=()
    classify_services DISCOVERED_SERVICES DISCOVERED_INFRA_SERVICES DISCOVERED_APP_SERVICES
    
    # 3. 컨테이너 이름 수집
    collect_all_container_names "$DOCKER_COMPOSE_FILE_ROOT_PATH"
    
    # 4. 이미지 패턴 생성
    discover_service_images "$DOCKER_COMPOSE_FILE_ROOT_PATH"
    
    # 5. 결과 출력
    echo ""
    echo "🎯 자동 감지 결과:"
    echo "┌─ Infrastructure 서비스 (${#DISCOVERED_INFRA_SERVICES[@]}개)"
    for svc in "${DISCOVERED_INFRA_SERVICES[@]}"; do
        echo "│  ├─ $svc"
    done
    echo "│"
    echo "├─ Application 서비스 (${#DISCOVERED_APP_SERVICES[@]}개)"
    for svc in "${DISCOVERED_APP_SERVICES[@]}"; do
        echo "│  ├─ $svc"
    done
    echo "│"
    echo "└─ 총 컨테이너: ${#DISCOVERED_CONTAINERS[@]}개"
    echo ""
    
    # 6. 사용자 확인
    read -p "[+] 감지된 서비스 목록이 올바른가요? (y/n): " confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" && "$confirm" != "" ]]; then
        log "WARN" "사용자가 자동 감지 결과를 거부했습니다."
        exit 1
    fi
    
    log "INFO" "✅ 자동 감지 완료! 스마트 설정으로 진행합니다."
}

# ================== 스마트 이미지 정리 함수 ==================
smart_cleanup_images() {
    local cleanup_type="$1"
    
    case "$cleanup_type" in
        "dangling")
            log "INFO" "Dangling 이미지 정리 중 (Layer Caching 유지)..."
            docker image prune -f
            ;;
        "selective")
            log "INFO" "Application 서비스 이미지만 선별 삭제 중..."
            
            for service in "${DISCOVERED_APP_SERVICES[@]}"; do
                local images
                images=$(docker images --format "table {{.Repository}}:{{.Tag}}" | grep -E "${service}" || true)
                if [[ -n "$images" ]]; then
                    log "INFO" "이미지 삭제: $service 관련 이미지들"
                    echo "$images" | while read -r img; do
                        if [[ "$img" != "REPOSITORY:TAG" ]]; then  # 헤더 제외
                            docker rmi -f "$img" &> /dev/null || :
                        fi
                    done
                fi
            done
            ;;
        "all")
            log "INFO" "모든 Application 서비스 이미지 강제 삭제 중..."
            
            # 패턴 기반 이미지 삭제
            for pattern in "${DISCOVERED_IMAGE_PATTERNS[@]}"; do
                local images
                images=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -E "${pattern//\*/.*}" || true)
                if [[ -n "$images" ]]; then
                    log "INFO" "패턴 '$pattern'에 해당하는 이미지들 삭제"
                    echo "$images" | while read -r img; do
                        docker rmi -f "$img" &> /dev/null || :
                    done
                fi
            done
            ;;
    esac
}

# ================== Docker 네트워크 생성 ==================
create_docker_network() {
    log "INFO" "Docker 네트워크 'drvalue_bmes_backend_net' 생성 중..."
    docker network create drvalue_bmes_backend_net &> /dev/null || log "WARN" "'drvalue_bmes_backend_net' 이미 존재"
}

# ================== 스마트 서비스 시작 함수 ==================
smart_start_service() {
    local service="$1"
    local file="${DOCKER_COMPOSE_FILE_ROOT_PATH}/${service}/docker-compose.yaml"
    
    if [[ -f "$file" ]]; then
        log "INFO" "서비스 시작: $service"
        
        # Docker Compose up 실행
        if ! ${DOCKER_COMPOSE_COMMAND} -f "$file" up -d; then
            log "ERROR" "❌ $service: Docker Compose 시작 실패 - 최근 로그 출력"
            ${DOCKER_COMPOSE_COMMAND} -f "$file" logs --no-color --tail=200 | cat || :
            return 1
        fi
        
        log "INFO" "서비스 시작 완료: $service"
    else
        log "ERROR" "Compose 파일 누락: $file"
        return 1
    fi
}

# ================== 서비스 선택 함수 ==================
select_services_to_exclude() {
    echo ""
    echo "🎯 실행하지 않을 서비스를 선택하세요:"
    echo "📦 Infrastructure 서비스:"
    
    local excluded_services=()
    local selected_services=()
    local service_numbers=()
    local all_services_display=()
    local counter=1
    
    # Infrastructure 서비스 표시
    for svc in "${DISCOVERED_INFRA_SERVICES[@]}"; do
        echo "  $counter) $svc"
        service_numbers["$counter"]="$svc"
        all_services_display+=("$counter:$svc")
        ((counter++))
    done
    
    echo ""
    echo "🏗️  Application 서비스:"
    
    # Application 서비스 표시
    for svc in "${DISCOVERED_APP_SERVICES[@]}"; do
        echo "  $counter) $svc"
        service_numbers["$counter"]="$svc"
        all_services_display+=("$counter:$svc")
        ((counter++))
    done
    
    echo ""
    echo "💡 사용법:"
    echo "  - 모드를 먼저 선택하세요: w=white list(입력한 번호만 실행), b=black list(입력한 번호 제외)"
    echo "  - 번호 입력: 1,3,5 또는 1 3 5"
    echo "  - 엔터만 누르면 선택 없음 (모드에 따라 전체 실행 또는 전체 실행에서 제외 없음)"
    echo "  - 'all' 입력 시: white list에서는 전체 실행, black list에서는 전체 제외"
    echo ""
    echo "🧭 모드 선택:"
    echo "  w) white list - 입력한 번호만 실행 대상으로 지정"
    echo "  b) black list - 입력한 번호를 제외 (기본)"
    read -p "[+] 선택 모드 (w/b, 기본=b): " selection_mode
    selection_mode=$(echo "${selection_mode:-b}" | tr '[:upper:]' '[:lower:]')
    if [[ "$selection_mode" != "w" && "$selection_mode" != "b" ]]; then
        log "WARN" "잘못된 모드 선택, 기본 black list로 진행합니다"
        selection_mode="b"
    fi
    
    # 저장된 제외 서비스 목록이 있으면 표시 (black list 모드에서만 적용)
    if [[ -n "${EXCLUDED_SERVICES:-}" ]]; then
        echo "💾 저장된 제외 서비스(black list 기반): $EXCLUDED_SERVICES"
        echo "  - 저장된 설정을 사용하려면 's'를 입력하세요 (모드=b 일 때만 적용)"
        echo ""
    fi
    
    read -p "[+] 제외할 서비스 번호를 입력하세요: " user_input
    
    # 저장된 설정 사용 (black list 모드에서만)
    if [[ "$user_input" == "s" && "$selection_mode" == "b" && -n "${EXCLUDED_SERVICES:-}" ]]; then
        IFS=',' read -ra excluded_services <<< "$EXCLUDED_SERVICES"
        log "INFO" "저장된 제외 서비스 설정을 사용합니다: ${EXCLUDED_SERVICES}"
        export FINAL_EXCLUDED_SERVICES=("${excluded_services[@]}")
        return 0
    fi
    
    # 입력 처리: 모드에 따라 분기
    if [[ "$selection_mode" == "b" ]]; then
        # black list: 입력한 서비스들을 제외
        if [[ "$user_input" == "all" ]]; then
            excluded_services=("${DISCOVERED_SERVICES[@]}")
            log "WARN" "모든 서비스가 제외되었습니다"
        elif [[ -n "$user_input" ]]; then
            user_input=$(echo "$user_input" | tr ',' ' ')
            for num in $user_input; do
                if [[ -n "${service_numbers[$num]:-}" ]]; then
                    excluded_services+=("${service_numbers[$num]}")
                    log "INFO" "제외된 서비스: ${service_numbers[$num]}"
                else
                    log "WARN" "잘못된 번호: $num"
                fi
            done
        fi
    else
        # white list: 입력한 서비스만 실행 대상으로 지정 → 나머지는 제외
        if [[ "$user_input" == "all" ]]; then
            selected_services=("${DISCOVERED_SERVICES[@]}")
            log "INFO" "모든 서비스가 실행 대상으로 지정되었습니다"
        elif [[ -n "$user_input" ]]; then
            user_input=$(echo "$user_input" | tr ',' ' ')
            for num in $user_input; do
                if [[ -n "${service_numbers[$num]:-}" ]]; then
                    selected_services+=("${service_numbers[$num]}")
                    log "INFO" "선택된 서비스: ${service_numbers[$num]}"
                else
                    log "WARN" "잘못된 번호: $num"
                fi
            done
        fi
    fi
    
    # 최종 제외 목록 계산 (white list는 전체에서 선택된 서비스 제외)
    local final_excluded=()
    if [[ "$selection_mode" == "w" ]]; then
        if [[ ${#selected_services[@]} -eq 0 ]]; then
            # 선택이 없으면 아무도 제외하지 않음 (전체 실행)
            final_excluded=()
        else
            for svc in "${DISCOVERED_SERVICES[@]}"; do
                local found=false
                for sel in "${selected_services[@]}"; do
                    if [[ "$svc" == "$sel" ]]; then
                        found=true; break
                    fi
                done
                if [[ "$found" == false ]]; then
                    final_excluded+=("$svc")
                fi
            done
        fi
    else
        final_excluded=("${excluded_services[@]}")
    fi

    # 결과 저장 및 출력
    if [[ ${#final_excluded[@]} -gt 0 ]]; then
        local excluded_str
        printf -v excluded_str '%s,' "${final_excluded[@]}"
        excluded_str="${excluded_str%,}"

        echo ""
        echo "❌ 제외된 서비스 (총 ${#final_excluded[@]}개):"
        for svc in "${final_excluded[@]}"; do
            echo "  - $svc"
        done

        # 설정 저장 여부 확인 (항상 제외 목록을 저장함. 재사용은 black list에서만 s로 지원)
        read -p "[+] 이 제외 설정을 저장하시겠습니까? (y/n): " save_exclude
        if [[ "$save_exclude" == "y" || "$save_exclude" == "Y" || "$save_exclude" == "" ]]; then
            export SAVE_EXCLUDED_SERVICES="$excluded_str"
            log "INFO" "제외 서비스 설정이 저장될 예정입니다"
        fi

        export FINAL_EXCLUDED_SERVICES=("${final_excluded[@]}")
    else
        log "INFO" "모든 서비스가 실행될 예정입니다"
        export FINAL_EXCLUDED_SERVICES=()
        export SAVE_EXCLUDED_SERVICES=""
    fi

    export SELECTION_MODE="$selection_mode"
}

# 모든 컨테이너 이름 수집 (서비스별 매핑 포함)
collect_all_container_names() {
    local compose_root="$1"
    local all_containers=()

    # 전역 연관배열: 서비스별 컨테이너 목록(space 구분)
    declare -gA SERVICE_CONTAINERS=()

    for service in "${DISCOVERED_SERVICES[@]}"; do
        local compose_file="$compose_root/$service/docker-compose.yaml"
        local service_containers=()
        if [[ -f "$compose_file" ]]; then
            while IFS= read -r container_name; do
                if [[ -n "$container_name" ]]; then
                    all_containers+=("$container_name")
                    service_containers+=("$container_name")
                fi
            done < <(discover_container_names "$compose_file")
        fi
        # space-joined 문자열로 저장
        SERVICE_CONTAINERS["$service"]="${service_containers[*]}"
    done

    export DISCOVERED_CONTAINERS=("${all_containers[@]}")
    log "INFO" "총 ${#all_containers[@]}개의 컨테이너 이름을 수집했습니다 (서비스별 매핑 포함)"
}

# 서비스 집합 -> 컨테이너 목록 집합으로 확장
services_to_containers() {
    local -n in_services=$1
    local out=()
    local s
    for s in "${in_services[@]}"; do
        local containers="${SERVICE_CONTAINERS[$s]}"
        if [[ -n "$containers" ]]; then
            # word-split 의도적 사용
            for c in $containers; do
                out+=("$c")
            done
        fi
    done
    printf '%s\n' "${out[@]}"
}

# 컨테이너 목록 삭제
delete_containers() {
    local -a targets=("$@")
    if [[ ${#targets[@]} -eq 0 ]]; then
        log "INFO" "삭제 대상 컨테이너가 없습니다."
        return 0
    fi
    log "INFO" "컨테이너 삭제 시작 (${#targets[@]}개)"
    for container in "${targets[@]}"; do
        if docker ps -a --format "{{.Names}}" | grep -q "^${container}$"; then
            log "INFO" "컨테이너 삭제: $container"
            docker rm -f "$container" &>/dev/null || :
        else
            log "WARN" "컨테이너 미존재(건너뜀): $container"
        fi
    done
    log "INFO" "컨테이너 삭제 완료"
}

# ================== 실행 대상 서비스 계산 ==================
compute_active_services() {
  ACTIVE_SERVICES=()
  for svc in "${DISCOVERED_SERVICES[@]}"; do
    if ! is_service_excluded "$svc"; then
      ACTIVE_SERVICES+=("$svc")
    fi
  done
  # export는 필요 없습니다 (배열 export 불가)
  # export ACTIVE_SERVICES
  log "INFO" "ACTIVE_SERVICES(${#ACTIVE_SERVICES[@]}): ${ACTIVE_SERVICES[*]}"
}

# ================== 서비스 제외 확인 함수 ==================
is_service_excluded() {
    local service="$1"
    for excluded in "${FINAL_EXCLUDED_SERVICES[@]}"; do
        if [[ "$service" == "$excluded" ]]; then
            return 0  # 제외됨
        fi
    done
    return 1  # 제외되지 않음
}

# ================== 메인 실행 흐름 ==================
main() {
    print_welcome
    
    # 1. 환경 변수 설정
    log "INFO" "환경 변수 설정 시작"
    set_environment_variable
    
    # 2. 자동 감지 및 검증
    auto_discover_and_validate
    
    # 3. 서비스 선택
    select_services_to_exclude
    
    # 4. 기존 컨테이너 삭제 (선택한 서비스만)
    compute_active_services
    read -p "[+] 선택한 서비스의 기존 컨테이너만 삭제하시겠습니까? (y/n): " ans
    if [[ "$ans" == "y" ]]; then
        log "INFO" "선택된 서비스(ACTIVE_SERVICES)의 컨테이너만 삭제합니다..."
        for service in "${ACTIVE_SERVICES[@]}"; do
            file="${DOCKER_COMPOSE_FILE_ROOT_PATH}/${service}/docker-compose.yaml"
            if [[ -f "$file" ]]; then
                log "INFO" "컨테이너 삭제: 서비스=${service}"
                # compose로 정의된 서비스 컨테이너 정리 (질문 없이 강제, 실행 중이면 정지)
                if ! ${DOCKER_COMPOSE_COMMAND} -f "$file" rm -f -s; then
                    # compose rm 실패 시 container_name 기반 개별 제거로 폴백
                    while IFS= read -r cname; do
                        [[ -z "$cname" ]] && continue
                        if docker ps -a --format "{{.Names}}" | grep -q "^${cname}$"; then
                            log "INFO" "폴백 삭제: $cname"
                            docker rm -f "$cname" &>/dev/null || :
                        fi
                    done < <(discover_container_names "$file")
                fi
            else
                log "WARN" "Compose 파일 없음: $file (스킵)"
            fi
        done
        log "INFO" "선택된 서비스 컨테이너 삭제 완료"
    fi

    # 5. 스마트 이미지 정리
    echo ""
    echo "🚀 이미지 정리 옵션을 선택하세요:"
    echo "1) dangling  - 불필요한 이미지만 정리 (추천)"
    echo "2) selective - Application 서비스 이미지만 선별 삭제"
    echo "3) all       - 모든 관련 이미지 강제 삭제"
    echo "4) skip      - 이미지 정리 건너뛰기"
    echo ""
    read -p "[+] 선택하세요 (1-4): " image_option
    
    case "$image_option" in
        "1") smart_cleanup_images "dangling" ;;
        "2") smart_cleanup_images "selective" ;;
        "3") smart_cleanup_images "all" ;;
        "4") log "INFO" "이미지 정리를 건너뜁니다." ;;
        *) 
            log "WARN" "잘못된 선택, dangling 정리를 실행합니다."
            smart_cleanup_images "dangling"
            ;;
    esac

    # 6. 캐시 정리
    read -p "[+] 도커 캐시 삭제하시겠습니까? (y/n): " ans
    if [[ "$ans" == "y" ]]; then
        log "INFO" "도커 시스템 프룬 실행"
        docker system prune -f
    fi

    # 7. 네트워크 생성
    create_docker_network

    # 8. MySQL 특별 처리 (Galera 클러스터)
    if [[ " ${DISCOVERED_INFRA_SERVICES[*]} " =~ " drvalue-bmes-mysql " ]] && ! is_service_excluded "drvalue-bmes-mysql"; then
        # log "INFO" "🗄️  MySQL Galera 클러스터 초기화 시작"
        log "INFO" "🗄️  MySQL 초기화 시작"
        GALERA_FILE="${DOCKER_COMPOSE_FILE_ROOT_PATH}/drvalue-bmes-mysql/docker-compose.yaml"
        if [[ -f "$GALERA_FILE" ]]; then
            log "INFO" "Galera 부트스트랩: db1 (drvalue_bmes_db1)"
            # log "INFO" "부트스트랩: db (drvalue_bmes_db)"
            ${DOCKER_COMPOSE_COMMAND} -f "$GALERA_FILE" up -d db1
            # ${DOCKER_COMPOSE_COMMAND} -f "$GALERA_FILE" up -d db

            log "INFO" "부트스트랩: logdb (drvalue_bmes_logdb)"
            ${DOCKER_COMPOSE_COMMAND} -f "$GALERA_FILE" up -d logdb
            

      
            
            # db1이 완전히 시작될 때까지 대기
            log "INFO" "db1 컨테이너 시작 대기 중..."
            # log "INFO" "db 컨테이너 시작 대기 중..."
            local wait_count=0
            while ! docker ps --format "{{.Names}}" | grep -q "^drvalue_bmes_db1$" && [[ $wait_count -lt 30 ]]; do
            # while ! docker ps --format "{{.Names}}" | grep -q "^drvalue_bmes_db$" && [[ $wait_count -lt 30 ]]; do
                sleep 2
                ((wait_count++))
                echo -n "."
            done
            echo ""
            
            if docker ps --format "{{.Names}}" | grep -q "^drvalue_bmes_db1$"; then
            # if docker ps --format "{{.Names}}" | grep -q "^drvalue_bmes_db$"; then
                log "INFO" "✅ db1 (drvalue_bmes_db1) 시작 완료"
                # log "INFO" "✅ db (drvalue_bmes_db) 시작 완료"
                sleep 5  # 추가 안정화 시간
                
                log "INFO" "db2, db3 시작 (drvalue_bmes_db2, drvalue_bmes_db3)"
                ${DOCKER_COMPOSE_COMMAND} -f "$GALERA_FILE" up -d db2 db3
                
                # # 클러스터 상태 확인
                sleep 5
                local mysql_containers=("drvalue_bmes_db1" "drvalue_bmes_db2" "drvalue_bmes_db3")
                for container in "${mysql_containers[@]}"; do
                    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
                        log "INFO" "✅ $container: 실행 중"
                    else
                        log "WARN" "⚠️  $container: 시작 실패"
                    fi
                done
            else
                log "ERROR" "❌ db1 (drvalue_bmes_db1) 시작 실패 - Galera 클러스터 초기화 중단"
                # log "ERROR" "❌ db (drvalue_bmes_db) 시작 실패 - 초기화 중단"
            fi

                  log "INFO" "logdb 컨테이너 시작 대기 중..."
            local wait_count=0
            while ! docker ps --format "{{.Names}}" | grep -q "^drvalue_bmes_logdb$" && [[ $wait_count -lt 30 ]]; do
                sleep 2
                ((wait_count++))
                echo -n "."
            done
            echo ""

            if docker ps --format "{{.Names}}" | grep -q "^drvalue_bmes_logdb$"; then
                log "INFO" "✅ logdb (drvalue_bmes_logdb) 시작 완료"
            else
                log "ERROR" "❌ logdb (drvalue_bmes_logdb) 시작 실패 - 초기화 중단"
            fi
        fi

        # db2, db3 띄운 뒤 클러스터 안정화 기다리기
        # log "INFO" "Galera 클러스터 health 상태 확인 대기 시작"
        log "INFO" "MySQL health 상태 확인 대기 시작"
        local mysql_containers=("drvalue_bmes_db1" "drvalue_bmes_db2" "drvalue_bmes_db3")
        # local mysql_containers=("drvalue_bmes_db")

        local max_wait=60   # 최대 60초까지 기다림
        local waited=0
        local interval=3

        for container in "${mysql_containers[@]}"; do
            log "INFO" "⏳ $container health 확인 중..."
            while true; do
                status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "missing")
                if [[ "$status" == "healthy" ]]; then
                    log "INFO" "✅ $container: healthy"
                    break
                elif [[ "$status" == "unhealthy" ]]; then
                    log "ERROR" "❌ $container: unhealthy"
                    break
                fi

                if (( waited >= max_wait )); then
                    log "ERROR" "⏰ $container healthcheck 타임아웃 (${max_wait}s)"
                    break
                fi

                sleep $interval
                ((waited+=interval))
            done
        done
    elif [[ " ${DISCOVERED_INFRA_SERVICES[*]} " =~ " drvalue-bmes-mysql " ]]; then
        log "INFO" "📋 MySQL 서비스가 제외되었습니다"
    fi

    # 9. 모든 서비스 시작 (MySQL 제외, 이미 처리됨)
    log "INFO" "🚀 서비스 시작 중..."
    local started_count=0
    local skipped_count=0
    local failed_count=0

    # 8.5. Elasticsearch 특별 처리: 건강 상태가 확인되어야 이후 서비스 시작
    if [[ " ${DISCOVERED_INFRA_SERVICES[*]} " =~ " drvalue-bmes-es " ]] && ! is_service_excluded "drvalue-bmes-es"; then
        log "INFO" "🔎 Elasticsearch 시작 및 health 확인"
        if ! smart_start_service "drvalue-bmes-es"; then
            log "ERROR" "❌ Elasticsearch 시작 실패 - 이후 서비스 시작 중단"
            exit 1
        fi

        log "INFO" "drvalue_bmes_es 컨테이너 시작 대기 중..."
        local es_logs_pid=""
        if [[ -n "${SETUP_DEBUG:-}" ]]; then
            # ES 로그를 실시간으로 출력 (디버그 모드 전용)
            docker logs -f drvalue_bmes_es | sed -u 's/^/[ES] /' &
            es_logs_pid=$!
        fi
        local wait_count=0
        while ! docker ps --format "{{.Names}}" | grep -q "^drvalue_bmes_es$" && [[ $wait_count -lt 60 ]]; do
            sleep 2
            ((wait_count++))
            echo -n "."
        done
        echo ""

        local max_wait=180
        local waited=0
        local interval=5
        set +e
        while true; do
            status=$(docker inspect --format='{{.State.Health.Status}}' "drvalue_bmes_es" 2>/dev/null || echo "missing")
            if [[ "$status" == "healthy" ]]; then
                log "INFO" "✅ drvalue_bmes_es: healthy"
                if [[ -n "$es_logs_pid" ]]; then kill "$es_logs_pid" 2>/dev/null || :; fi
                ((started_count++))
                break
            elif [[ "$status" == "unhealthy" ]]; then
                log "ERROR" "❌ drvalue_bmes_es: unhealthy - 이후 서비스 시작 중단"
                if [[ -n "$es_logs_pid" ]]; then kill "$es_logs_pid" 2>/dev/null || :; fi
                exit 1
            fi
            if (( waited >= max_wait )); then
                log "ERROR" "⏰ drvalue_bmes_es healthcheck 타임아웃 (${max_wait}s) - 이후 서비스 시작 중단"
                if [[ -n "$es_logs_pid" ]]; then kill "$es_logs_pid" 2>/dev/null || :; fi
                exit 1
            fi
            sleep $interval
            ((waited+=interval))
        done
    elif [[ " ${DISCOVERED_INFRA_SERVICES[*]} " =~ " drvalue-bmes-es " ]]; then
        log "INFO" "📋 Elasticsearch 서비스가 제외되었습니다"
    fi

    set +e

    for service in "${DISCOVERED_SERVICES[@]}"; do
        if [[ "$service" == "drvalue-bmes-mysql" ]]; then
            # MySQL은 이미 위에서 특별 처리됨 → skip
            continue
        elif [[ "$service" == "drvalue-bmes-es" ]]; then
            # Elasticsearch는 이미 위에서 health 확인 후 처리됨 → skip
            continue
        elif [[ "$service" == "drvalue-bmes-redis" ]]; then
            if is_service_excluded "drvalue-bmes-redis"; then
                log "INFO" "⏭️  서비스 제외: drvalue-bmes-redis"
                ((skipped_count++))
            else
                log "INFO" "🚀 Redis 클러스터 시작"
                smart_start_service "drvalue-bmes-redis"
                ((started_count++))

                # Redis 노드 health 확인
                log "INFO" "⏳ Redis 노드 health 상태 확인 중..."
                local redis_nodes=("drvalue_bmes_redis_node_0" "drvalue_bmes_redis_node_1" "drvalue_bmes_redis_node_2" "drvalue_bmes_redis_node_3" "drvalue_bmes_redis_node_4" "drvalue_bmes_redis_node_5")
                local max_wait=120
                local interval=5
                for node in "${redis_nodes[@]}"; do
                    local waited=0
                    while true; do
                        status=$(docker inspect --format='{{.State.Health.Status}}' "$node" 2>/dev/null || echo "missing")
                        if [[ "$status" == "healthy" ]]; then
                            log "INFO" "✅ $node healthy"
                            break
                        elif [[ "$status" == "unhealthy" ]]; then
                            log "ERROR" "❌ $node unhealthy"
                            break
                        fi
                        if (( waited >= max_wait )); then
                            log "ERROR" "⏰ $node healthcheck 타임아웃 (${max_wait}s)"
                            break
                        fi
                        sleep $interval
                        ((waited+=interval))
                    done
                done
            fi
        else
            if is_service_excluded "$service"; then
                log "INFO" "⏭️  서비스 제외: $service"
                ((skipped_count++))
            else
                smart_start_service "$service"
                ((started_count++))
            fi
        fi
    done
    set -e

    # 10. 제외 서비스 설정 저장 (필요한 경우)
    if [[ -n "${SAVE_EXCLUDED_SERVICES:-}" ]]; then
        save_config "$DOPPLER_TOKEN_CUSTOM" "$APP_ROOT_PATH" "$SAVE_EXCLUDED_SERVICES"
    fi

    # 11. 완료
    log "INFO" "🎉 서비스 구성 완료!"
    
    echo ""
    echo "✨ 스마트 자동 감지 환경 구성이 완료되었습니다!"
    echo "🤖 감지된 서비스: ${#DISCOVERED_SERVICES[@]}개"
    echo "🚀 시작된 서비스: $started_count개"
    echo "⏭️  제외된 서비스: $skipped_count개"
    if [[ $failed_count -gt 0 ]]; then
        echo "❌ 실패한 서비스: $failed_count개"
    fi
    echo "📦 Infrastructure: ${#DISCOVERED_INFRA_SERVICES[@]}개 (${DISCOVERED_INFRA_SERVICES[*]})"
    echo "🏗️  Application: ${#DISCOVERED_APP_SERVICES[@]}개 (${DISCOVERED_APP_SERVICES[*]})"
    echo "🐳 총 컨테이너: ${#DISCOVERED_CONTAINERS[@]}개"
    
    if [[ ${#FINAL_EXCLUDED_SERVICES[@]} -gt 0 ]]; then
        echo ""
        echo "❌ 제외된 서비스:"
        for excluded in "${FINAL_EXCLUDED_SERVICES[@]}"; do
            echo "  - $excluded"
        done
    fi
    
    echo ""
    echo "📋 실행된 컨테이너 목록:"
    for container in "${DISCOVERED_CONTAINERS[@]}"; do
        if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
            local status
            status=$(docker ps --filter "name=^${container}$" --format "{{.Status}}")
            echo "  ✅ $container ($status)"
        else
            echo "  ❌ $container (정지됨 또는 시작 실패)"
        fi
    done
    echo ""
    echo "⚡ 하드코딩 없는 스마트한 자동화!"
    echo "💾 설정이 저장되어 다음 실행이 더욱 편리합니다!"
}

# 스크립트 실행
main "$@" 