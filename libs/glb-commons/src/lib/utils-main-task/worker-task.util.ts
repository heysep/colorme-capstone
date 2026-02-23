/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { FIGLET_FONT_PATH } from './main-task.util';

export interface WorkerTaskUtilInterface {
  appModule: any;
  envName: {
    apiVersion: string;
    apiPrefix: string;
    apiPort: string;
    rabbitQueue: string;
    rabbitUrls: string;
  };
  isRunCluster?: boolean;
  isNoUseHelmet?: boolean;
  onBeforeRun?: (app: NestExpressApplication) => Promise<void>;
  rabbitMqOptions?: {
    prefetchCount?: number;
    noAck?: boolean;
  };
}

export class WorkerTaskUtil {
  private static logger = new Logger(WorkerTaskUtil.name);
  /**
   * 메인 태스크 실행
   * @param options 메인 태스크 인터페이스
   */
  static async run(options: WorkerTaskUtilInterface): Promise<void> {
    // ------------------
    const figlet = require('figlet');
    const fs = require('fs');
    // ------------------

    // 트랜잭션 컨텍스트 초기화
    initializeTransactionalContext({
      storageDriver: StorageDriver.AUTO,
    });

    // NestJS 앱 생성
    const app = await NestFactory.create<NestExpressApplication>(
      options?.appModule,
    );

    // ConfigService 주입
    const configService = app.get(ConfigService);

    // API 설정 로드
    const apiPrefix = configService.get<string>(options?.envName?.apiPrefix);
    if (!apiPrefix) {
      throw new Error(
        `API_PREFIX 설정이 올바르지 않습니다. [ API_PREFIX: ${apiPrefix} ]`,
      );
    }
    const apiPort = configService.get<number>(options?.envName?.apiPort);
    if (!apiPort || isNaN(apiPort) || apiPort < 0 || apiPort > 65535) {
      throw new Error(
        `API_PORT 설정이 올바르지 않습니다. [ API_PORT: ${apiPort} ]`,
      );
    }
    const apiVersion = configService.get<string>(options?.envName?.apiVersion);
    if (!apiVersion) {
      throw new Error(
        `API_VERSION 설정이 올바르지 않습니다. [ API_VERSION: ${apiVersion} ]`,
      );
    }

    // RabbitMQ 설정 로드
    const rabbitUrls: string | undefined = configService.get<string>(
      options?.envName?.rabbitUrls,
    );
    const rabbitQueue: string | undefined = configService.get<string>(
      options?.envName?.rabbitQueue,
    );
    if (!rabbitUrls || !rabbitQueue) {
      throw new Error(
        `RabbitMQ 설정이 올바르지 않습니다. [ RABBITMQ_URLS: ${rabbitUrls} / RABBITMQ_QUEUE: ${rabbitQueue} ]`,
      );
    }
    const rabbitUrlArr: string[] = rabbitUrls.split(',');

    // Rest 기본 설정
    app.enableCors({
      origin: '*', // 또는 특정 도메인/IP를 지정
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    app?.set('trust proxy', 1);
    app?.setGlobalPrefix(apiPrefix);
    app?.enableShutdownHooks();
    app?.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: apiVersion,
    });

    // ----------------------------------------
    const fontFilePath = FIGLET_FONT_PATH; // 폰트 파일 경로
    const fontData = fs.readFileSync(fontFilePath, 'utf-8');
    figlet.parseFont('custom-font', fontData);
    const figletText = await figlet.textSync('sihun-cms nx', {
      font: 'custom-font',
      width: 80,
      horizontalLayout: 'default',
      verticalLayout: 'default',
      whitespaceBreak: true,
    });
    console.log(figletText);
    // ----------------------------------------

    // RabbitMQ 연결
    // ----------------------------------------
    app.connectMicroservice<MicroserviceOptions>(
      {
        transport: Transport.RMQ,
        options: {
          urls: rabbitUrlArr,
          queue: rabbitQueue,
          queueOptions: {
            durable: true,
          },
          ...(options?.rabbitMqOptions ?? {}),
        },
      },
      {
        inheritAppConfig: true,
      },
    );
    // ----------------------------------------

    // 도플러 정보 출력
    // ----------------------------------------
    const dopplerConfig: string | undefined =
      configService.get('DOPPLER_CONFIG');
    if (dopplerConfig) {
      this.logger.log(`🚀 Doppler Config: ${dopplerConfig}`);
    }
    const dopplerEnvironment: string | undefined = configService.get(
      'DOPPLER_ENVIRONMENT',
    );
    if (dopplerEnvironment) {
      this.logger.log(`🚀 Doppler Environment: ${dopplerEnvironment}`);
    }
    const dopplerProject: string | undefined =
      configService.get('DOPPLER_PROJECT');
    if (dopplerProject) {
      this.logger.log(`🚀 Doppler Project: ${dopplerProject}`);
    }
    const dopplerEnvVersion: string | undefined =
      configService.get('ENV_VERSION');
    if (dopplerEnvVersion) {
      this.logger.log(`🚀 Doppler Env Version: ${dopplerEnvVersion}`);
    }
    // ----------------------------------------

    // 모든 마이크로서비스를 동시에 시작
    await app.startAllMicroservices();
    // HTTP 서버도 동시에 listen
    await app.listen(apiPort, '0.0.0.0');

    this.logger.log(
      `🚀 Application is running on: http://localhost:${apiPort}/${apiPrefix} [${apiVersion}]`,
    );
  }
}
