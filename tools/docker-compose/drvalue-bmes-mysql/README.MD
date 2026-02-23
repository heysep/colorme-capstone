# 도커 컴포즈 파일 [ MySQL ]

아래 내용은 간편한 서버 배포 및 관리를 위한 도커 컴포즈 설정 가이드입니다.

## 설명

데이터의 보존을 위한 RDB 데이터베이스

## 의존성

해당 파일은 다음과 같은 의존성이 존재 합니다.

- 도커
  - 도커 외부 네트워크
- 환경변수
  - MySQL Root 사용자 계정 (환경 변수 이름: MARIADB_ROOT_USER)
  - MySQL Root 사용자 비밀번호 (환경 변수 이름: MARIADB_ROOT_PASSWORD)
  - MySQL BackEnd 사용자 비밀번호 (환경 변수 이름: MARIADB_PASSWORD)
  - MySQL 백업 사용자 계정 (환경 변수 이름: MARIADB_GALERA_MARIABACKUP_USER)
  - MySQL 백업 사용자 비밀번호 (환경 변수 이름: MARIADB_GALERA_MARIABACKUP_PASSWORD)

# .env

## 유의사항

컴포즈를 실행하였지만 컨테이너가 바로 꺼지는 경우 data_mnt_db1~n 까지 폴더의 권한을 확인할 필요가 있음, `chmod -R 777 data_mnt_db1~n` 명령어를 통해 권한을 부여하여 해결
