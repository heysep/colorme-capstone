/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef, NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'body-parser';
import * as cluster from 'cluster';
import helmet from 'helmet';
import * as os from 'os';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { ModuleRefInterceptor } from './module-ref.interceptor';
import { QuerySkipValidationPipe } from './query-skip-validation.pipe';
import expressBasicAuth = require('express-basic-auth');
import path = require('path');

export const FIGLET_FONT_ORIGINAL_PATH = 'resources/figlet-fonts/Chunky.flf';
export const FIGLET_FONT_PATH = path.join(
  __dirname,
  `../../../${FIGLET_FONT_ORIGINAL_PATH}`,
);

export interface MainTaskUtilInterface {
  appModule: any;
  envName: {
    apiVersion: string;
    apiPrefix: string;
    apiPort: string;
    rabbitQueue: string;
    rabbitUrls: string;
    swaggerTitle: string;
    swaggerDescription: string;
    swaggerVersion: string;
  };
  isRunCluster?: boolean;
  isNoUseHelmet?: boolean;
  onBeforeRun?: (
    app: NestExpressApplication,
    values: MainTaskUtiloptions,
  ) => Promise<void>;
  rabbitMqOptions?: {
    prefetchCount?: number;
    noAck?: boolean;
  };
}

export interface MainTaskUtiloptions {
  apiPrefix: string;
  apiPort: number;
  apiVersion: string;
}

export class MainTaskUtil {
  private static logger = new Logger(MainTaskUtil.name);
  /**
   * 메인 태스크 실행
   * @param options 메인 태스크 인터페이스
   */
  static async run(options: MainTaskUtilInterface): Promise<void> {
    if (options?.isRunCluster === null || options?.isRunCluster === undefined) {
      options.isRunCluster = true;
    }

    if (cluster.default.isPrimary && options?.isRunCluster === true) {
      const numCPUs = os.cpus().length;

      console.log(`마스터 프로세스 시작: PID=${process.pid}`);

      // 모든 시그널 핸들러 추가
      const signalHandlers = [
        'SIGTERM',
        'SIGINT',
        'SIGHUP',
        'SIGUSR1',
        'SIGUSR2',
      ];
      signalHandlers.forEach((signal) => {
        process.on(signal, () => {
          this.logger.error(`🚨 받은 시그널: ${signal}, PID: ${process.pid}`);
          if (cluster.default.isPrimary) {
            this.logger.error(`🚨 마스터 프로세스 종료 중...`);
          }
        });
      });

      // 최대 8개의 워커만 생성
      const maxWorkers = Math.min(
        numCPUs,
        process.env?.['NODE_CLUSTER_MAX_WORKER_COUNT'] as any,
      );

      this.logger.log(
        `마스터 프로세스가 실행 중입니다. ${maxWorkers}개의 워커를 포크합니다.`,
      );

      // CPU 코어 수만큼 워커 생성
      for (let i = 0; i < maxWorkers; i++) {
        cluster.default.fork();
      }

      // 워커가 종료되면 새로운 워커를 생성
      const MAX_RESTART = 5,
        WINDOW_MS = 60000;
      let restarts: number[] = [];
      cluster.default.on('exit', (w, code, sig) => {
        this.logger.error(
          `워커 ${w.process.pid} 종료: code=${code}, signal=${sig}`,
        );

        if (code === 0) return; // 정상 종료면 무시
        const now = Date.now();
        restarts = restarts.filter((t) => now - t < WINDOW_MS);
        if (restarts.length >= MAX_RESTART) {
          this.logger.error('워커 재시작 한도 초과. 마스터 종료');
          process.exit(1);
        }

        restarts.push(now);
        cluster.default.fork();
      });

      return;
    }

    // ------------------
    const figlet = require('figlet');
    const fs = require('fs');
    // ------------------

    // 트랜잭션 컨텍스트 초기화
    initializeTransactionalContext({
      storageDriver: StorageDriver.AUTO,
    });

    process.on('uncaughtException', (e) => {
      console.error('UNCAUGHT', e);
    });
    process.on('unhandledRejection', (r) => {
      console.error('UNHANDLED REJECTION', r);
    });
    process.on('SIGTERM', () => {
      console.error('RECEIVED SIGTERM');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.error('RECEIVED SIGINT');
      process.exit(0);
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
    app?.use(json({ limit: '100mb' }));
    app?.set('trust proxy', 1);
    app?.setGlobalPrefix(apiPrefix);
    app?.enableShutdownHooks();
    app?.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: apiVersion,
    });
    // Class validator pipe (쿼리 파라미터는 검증하지 않음)
    app?.useGlobalPipes(
      new QuerySkipValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: false,
      }),
    );

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

    // Swagger 설정
    // ----------------------------------------
    const swaggerUser = configService.get('SWAGGER_USER');
    const swaggerPassword = configService.get('SWAGGER_PASSWORD');
    const swaggerDev = configService.get('IS_DEV');
    if (!swaggerUser || !swaggerPassword) {
      throw new Error(
        `SWAGGER_USER 또는 SWAGGER_PASSWORD 설정이 올바르지 않습니다. [ SWAGGER_USER: ${swaggerUser} / SWAGGER_PASSWORD: ${swaggerPassword} ]`,
      );
    }

    this.logger.log(`🚀 Swagger URL: ${apiPrefix}/docs`);
    this.logger.log(
      `🚀 Swagger Dev: ${swaggerDev} [type: ${typeof swaggerDev}]`,
    );
    if (swaggerDev?.toLowerCase() !== 'true') {
      app.use(
        [
          `/${apiPrefix}/docs`,
          `/${apiPrefix}/docs-json`,
          `/${apiPrefix}/docs-yaml`,
          `/${apiPrefix}/docs/*rest`, // ← 수정: '/docs/*' → '/docs/:rest*'
        ],
        expressBasicAuth({
          challenge: true,
          users: { [swaggerUser]: swaggerPassword },
        }),
      );
    }

    // Swagger UI
    const config = new DocumentBuilder()
      .setTitle(options?.envName?.swaggerTitle)
      .setDescription(options?.envName?.swaggerDescription)
      .setVersion(options?.envName?.swaggerVersion)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          in: 'header',
        },
        'jwt-token',
      )
      .build();

    // config를 바탕으로 swagger document 생성
    const document = SwaggerModule.createDocument(app, config);
    // Swagger UI에 대한 path를 연결함
    // .setup('swagger ui endpoint', app, swagger_document)
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      patchDocumentOnRequest: (req: any, res: any, document: any) => {
        // 헤더 추출
        const xdr = req.headers?.['x-region'] ?? null;
        if (xdr) {
          document.servers = [
            {
              url: `/${xdr}`,
            },
          ];
        }

        return document;
      },
    });
    // ----------------------------------------

    app.use(
      helmet({
        // CSP를 완전히 비활성화
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );

    // 글로벌 인터셉터 등록
    app.useGlobalInterceptors(new ModuleRefInterceptor(app.get(ModuleRef)));

    // 모든 마이크로서비스를 동시에 시작
    await app.startAllMicroservices();

    if (options?.onBeforeRun) {
      await options.onBeforeRun(app, {
        apiPrefix,
        apiPort,
        apiVersion,
      });
    }

    // HTTP 서버도 동시에 listen
    await app.listen(apiPort, '0.0.0.0');
    // 기존 메모리 모니터링 강화
    setInterval(() => {
      const m = process.memoryUsage();
      const uptime = process.uptime();

      // 파일 디스크립터 확인
      let fdInfo = 'N/A';
      try {
        const fs = require('fs');
        const fdCount = fs.readdirSync('/proc/self/fd').length;
        fdInfo = `${fdCount}`;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        /* ignore */
      }

      // 클러스터 정보
      const clusterInfo = cluster.default.isPrimary
        ? `Master(Workers:${Object.keys(cluster.default.workers || {}).length})`
        : `Worker(${process.pid})`;

      this.logger.log(
        `[HEALTH] ${clusterInfo} | Uptime: ${Math.floor(uptime / 60)}m | ` +
          `RSS: ${(m.rss / 1024 / 1024).toFixed(1)}MB | ` +
          `Heap: ${(m.heapUsed / 1024 / 1024).toFixed(1)}MB | ` +
          `FD: ${fdInfo}`,
      );
    }, 300000); // 5분 마다

    this.logger.log(
      `🚀 Application is running on: http://localhost:${apiPort}/${apiPrefix} [${apiVersion}]`,
    );
  }
}
