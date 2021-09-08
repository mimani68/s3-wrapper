#!/usr/bin/make -f

PROJECT = "Minio storage system"

DOCKER_COMPOSE_FILE=docker-compose.yaml
DOCKER_COMPOSE_PROD_FILE=docker-compose-prod.yaml
NAMESPACE=file

BUCKET_TITLE=blk
LOCAL_SERVER_ADDRESS=api.localhost/api/v1
# IMAGE_PATH=/home/dev/drive_one/projects/dappi/core/public/
IMAGE_PATH=/root/storage-wrapper-service/public/
IMAGE_NAME=poster.png

Black=\033[0;30m
Red=\033[0;31m
Green=\033[0;32m
Yellow=\033[0;33m
Blue=\033[0;34m
Purple=\033[0;35m
Cyan=\033[0;36m
White=\033[0;37m
NC=\033[0m

all: up

clean:
	docker-compose -f ${DOCKER_COMPOSE_FILE} -p ${NAMESPACE} down --remove-orphans

up: 
	@echo "${Yellow}======== UP ========${NC}"
	POSTGRES_IMAGE=postgres:12.3 \
	MINIO_IMAGE=minio/minio:RELEASE.2020-12-18T03-27-42Z \
	ADMINER_IMAGE=adminer \
	docker-compose -f ${DOCKER_COMPOSE_FILE} -p ${NAMESPACE} up --remove-orphans
	@echo "${Yellow}======== END ========${NC}"

down:
	@echo "${Yellow}======== DOWN ========${NC}"
	docker-compose -f ${DOCKER_COMPOSE_FILE} -p ${NAMESPACE} down --remove-orphans
	@echo "${Yellow}======== END ========${NC}"

up-prod: 
	@echo "${Yellow}======== UP ========${NC}"
	POSTGRES_IMAGE=postgres:12.3 \
	MINIO_IMAGE=minio/minio:RELEASE.2020-12-18T03-27-42Z \
	ADMINER_IMAGE=adminer \
	docker-compose -f ${DOCKER_COMPOSE_PROD_FILE} -p ${NAMESPACE} up --remove-orphans
	@echo "${Yellow}======== END ========${NC}"

down-prod:
	@echo "${Yellow}======== DOWN ========${NC}"
	docker-compose -f ${DOCKER_COMPOSE_PROD_FILE} -p ${NAMESPACE} down --remove-orphans
	@echo "${Yellow}======== END ========${NC}"

service_setup:
	@echo "${Yellow}======== SETUP ========${NC}"
	http -f POST ${LOCAL_SERVER_ADDRESS}/setup/${BUCKET_TITLE}
	@echo "${Yellow}======== END ========${NC}"

reset:
	docker restart ${NAMESPACE}_app_1

ping:
	@echo "${Yellow}======== PING ========${NC}"
	http --print=h ${LOCAL_SERVER_ADDRESS}/ping
	@echo "${Yellow}======== END ========${NC}"

build_app:
	@echo "${Yellow}======== BUILD ========${NC}"
	docker-compose -f ${DOCKER_COMPOSE_FILE} -p ${NAMESPACE} build --build-arg "POSTGRES_IMAGE=postgres:12.3 MINIO_IMAGE=minio/minio:RELEASE.2020-12-18T03-27-42Z ADMINER_IMAGE=adminer"
	@echo "${Yellow}======== END ========${NC}"

help:
	@echo
	@echo make up
	@echo make down
	@echo make ping
	@echo make build_app
	@echo

doctor:
	@echo "${Green}[ok]${NC}" `docker-compose --version`
	@echo "${Green}[ok]${NC}" `docker --version`
	@echo "${Green}[ok]${NC}" `git --version`
	@echo "${Green}[ok]${NC}" http `http --version`

.PHONY: test up clean
