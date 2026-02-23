# =========================================
# Simple Service Dockerfile
# Build args를 통해 각 서비스 커스터마이징
# =========================================

FROM node:20-alpine

# pnpm 설치 시 오류 방지
RUN export COREPACK_ENABLE_STRICT=0

# Doppler CLI 설치
RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' \
    -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add --no-cache doppler

# pnpm 글로벌 설치
RUN npm install -g pnpm

WORKDIR /app

# 패키지 설치 (SERVICE_NAME 없이)
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --ignore-scripts

# 앱 코드 복사
COPY . .

# SERVICE_NAME을 마지막에!
ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

# 빌드된 애플리케이션 실행
CMD ["/bin/sh", "-c", "doppler run -- pnpm nx serve \"$SERVICE_NAME\""]