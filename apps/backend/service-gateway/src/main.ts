/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'body-parser';
import * as cluster from 'cluster';
import { Request, Response } from 'express';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as os from 'os';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';
import { AppModule } from './app/app.module';

export const MAX_PROXY_TIMEOUT = 60000;

async function bootstrap() {
  // 트랜잭션 컨텍스트 초기화
  initializeTransactionalContext({
    storageDriver: StorageDriver.AUTO,
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ------------------
  const figlet = require('figlet');
  const fs = require('fs');
  const path = require('path');
  // ------------------

  // ConfigService 주입
  const configService = app.get(ConfigService);
  const eventEmitter = app.get(EventEmitter2);
  const logger = new Logger('GatewayMain');

  // 도플러 정보 출력
  // ----------------------------------------
  const dopplerConfig: string | undefined = configService.get('DOPPLER_CONFIG');
  if (dopplerConfig) {
    logger.log(`🚀 Doppler Config: ${dopplerConfig}`);
  }
  const dopplerEnvironment: string | undefined = configService.get(
    'DOPPLER_ENVIRONMENT',
  );
  if (dopplerEnvironment) {
    logger.log(`🚀 Doppler Environment: ${dopplerEnvironment}`);
  }
  const dopplerProject: string | undefined =
    configService.get('DOPPLER_PROJECT');
  if (dopplerProject) {
    logger.log(`🚀 Doppler Project: ${dopplerProject}`);
  }
  const dopplerEnvVersion: string | undefined =
    configService.get('ENV_VERSION');
  if (dopplerEnvVersion) {
    logger.log(`🚀 Doppler Env Version: ${dopplerEnvVersion}`);
  }
  // ----------------------------------------

  // 게이트웨이 정보 출력
  // ----------------------------------------
  const gatewayPrefix = configService.get<string>('GATEWAY_PREFIX');
  const gatewayPort = configService.get<number>('GATEWAY_PORT');
  if (!gatewayPrefix || !gatewayPort) {
    throw new Error('GATEWAY_PREFIX or GATEWAY_PORT is not set');
  }
  logger.log(`🚀 Gateway Prefix: ${gatewayPrefix}`);
  logger.log(`🚀 Gateway Port: ${gatewayPort}`);
  // ----------------------------------------

  // ----------------------------------------
  const fontFilePath = path.join(
    __dirname,
    '../../../resources/figlet-fonts/Chunky.flf',
  ); // 폰트 파일 경로
  const fontData = fs.readFileSync(fontFilePath, 'utf-8');
  figlet.parseFont('custom-font', fontData);
  const figletText = figlet.textSync('capstone-project nx', {
    font: 'custom-font',
    width: 80,
    horizontalLayout: 'default',
    verticalLayout: 'default',
    whitespaceBreak: true,
  });
  console.log(figletText);
  // ----------------------------------------

  // ===========================<<< 리버스 프록시 설정 >>>=========================================
  const onProxyReq = (proxyReq, req, res) => {
    // 클라이언트의 IP 주소를 서버에 전달한다.
    const clientIp = req.socket.remoteAddress ?? 'unknown';

    proxyReq.setHeader('X-Real-IP', clientIp);
    proxyReq.setHeader('X-Forwarded-For', clientIp);

    try {
      const logEvent = {
        message: `Proxy req: ${proxyReq.path} --> ${clientIp}`,
        metadata: {
          path: proxyReq.path,
          clientIp,
          type: 'proxy',
        },
      };
      // logger.debug(`Emitting gateway log event: ${JSON.stringify(logEvent)}`);
      eventEmitter.emit('gateway.log', logEvent);
    } catch (error) {
      logger.error('Error emitting gateway log event:', error);
    }
  };

  // CORS 설정
  const allowedOrigins = (configService.get<string>('CORS_ALLOWED_ORIGINS') ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  type ParseProxyMiddlewareValueType = {
    rootPrefix: string;
    serviceName: string;
    fullInputUrl: string;
    host: string;
    port: number;
    target: string;
  };
  const parseProxyMiddlewareValue = (
    mappingEnvName: string,
  ): ParseProxyMiddlewareValueType => {
    let envValue: string;

    try {
      envValue = configService.get<string>(mappingEnvName);

      const proxyValue = envValue.split('>>');

      const rootPrefix = gatewayPrefix;
      const serviceName = proxyValue[0];

      const proxyTarget = proxyValue[1];

      const proxyDetailAddress = proxyTarget.split('||');

      const proxyTargetValue = proxyDetailAddress[0].split(':');

      let host = proxyTargetValue[0];
      let port = proxyTargetValue[1];
      let path = proxyDetailAddress[1];

      if (host.includes('##')) {
        host = configService.get<string>(host.replace('##', ''));
      }
      if (port.includes('##')) {
        port = configService.get<string>(port.replace('##', ''));
      }
      if (path.includes('##')) {
        path = configService.get<string>(path.replace('##', ''));
      }

      const target = `http://${host}:${port}${path ? `/${path}` : ''}`;

      const logEvent = {
        message: `Proxy mapping value: ${rootPrefix}/${serviceName} >> ${target}`,
        metadata: {
          path: `${rootPrefix}/${serviceName}`,
          clientIp: 'N/A',
          type: 'mapping',
        },
      };
      // logger.debug(`Emitting gateway log event: ${JSON.stringify(logEvent)}`);

      return {
        rootPrefix,
        serviceName,
        fullInputUrl: `${rootPrefix}/${serviceName}`,
        host,
        port: parseInt(port),
        target,
      };
    } catch (error) {
      const logEvent = {
        message: `Invalid proxy target value: ${error}`,
        metadata: {
          path: 'N/A',
          clientIp: 'N/A',
          type: 'mapping',
        },
      };
      // logger.debug(`Emitting gateway log event: ${JSON.stringify(logEvent)}`);
      eventEmitter.emit('gateway.log', logEvent);

      throw new Error(
        `Invalid proxy target value: ${error} / original value: ${envValue}`,
      );
    }
  };

  //
  // Auth 서버 프록시 설정
  //
  const authProxyValue = parseProxyMiddlewareValue('GATEWAY_MAPPING_SERV_AUTH');
  app.use(
    [`/${authProxyValue.fullInputUrl}`],
    createProxyMiddleware<Request, Response>({
      target: authProxyValue.target,
      changeOrigin: true,
      secure: dopplerConfig === 'prd',
      proxyTimeout: MAX_PROXY_TIMEOUT,
      on: {
        proxyReq: onProxyReq,
      },
    }),
  );
  //
  // Baseinfo 서버 프록시 설정
  //
  const baseinfoProxyValue = parseProxyMiddlewareValue(
    'GATEWAY_MAPPING_SERV_BASEINFO',
  );
  app.use(
    [`/${baseinfoProxyValue.fullInputUrl}`],
    createProxyMiddleware<Request, Response>({
      target: baseinfoProxyValue.target,
      changeOrigin: true,
      secure: dopplerConfig === 'prd',
      proxyTimeout: MAX_PROXY_TIMEOUT,
      on: {
        proxyReq: onProxyReq,
      },
    }),
  );
  //
  // Sales 서버 프록시 설정
  //
  const salesProxyValue = parseProxyMiddlewareValue(
    'GATEWAY_MAPPING_SERV_SALES',
  );
  app.use(
    [`/${salesProxyValue.fullInputUrl}`],
    createProxyMiddleware<Request, Response>({
      target: salesProxyValue.target,
      changeOrigin: true,
      secure: dopplerConfig === 'prd',
      proxyTimeout: MAX_PROXY_TIMEOUT,
      on: {
        proxyReq: onProxyReq,
      },
    }),
  );
  //
  // Research 서버 프록시 설정
  //
  const researchProxyValue = parseProxyMiddlewareValue(
    'GATEWAY_MAPPING_SERV_RESEARCH',
  );
  app.use(
    [`/${researchProxyValue.fullInputUrl}`],
    createProxyMiddleware<Request, Response>({
      target: researchProxyValue.target,
      changeOrigin: true,
      secure: dopplerConfig === 'prd',
      proxyTimeout: MAX_PROXY_TIMEOUT,
      on: {
        proxyReq: onProxyReq,
      },
    }),
  );
  //
  // Production 서버 프록시 설정
  //
  const productionProxyValue = parseProxyMiddlewareValue(
    'GATEWAY_MAPPING_SERV_PRODUCTION',
  );
  app.use(
    [`/${productionProxyValue.fullInputUrl}`],
    createProxyMiddleware<Request, Response>({
      target: productionProxyValue.target,
      changeOrigin: true,
      secure: dopplerConfig === 'prd',
      proxyTimeout: MAX_PROXY_TIMEOUT,
      on: {
        proxyReq: onProxyReq,
      },
    }),
  );
  //
  // File Manager 서버 프록시 설정
  //
  const fileManagerProxyValue = parseProxyMiddlewareValue(
    'GATEWAY_MAPPING_SERV_FILE_MNG',
  );
  app.use(
    [`/${fileManagerProxyValue.fullInputUrl}`],
    createProxyMiddleware<Request, Response>({
      target: fileManagerProxyValue.target,
      changeOrigin: true,
      secure: dopplerConfig === 'prd',
      proxyTimeout: MAX_PROXY_TIMEOUT,
      on: {
        proxyReq: onProxyReq,
      },
    }),
  );
  //
  // Stock 서버 프록시 설정
  //
  const stockProxyValue = parseProxyMiddlewareValue(
    'GATEWAY_MAPPING_SERV_STOCK',
  );
  app.use(
    [`/${stockProxyValue.fullInputUrl}`],
    createProxyMiddleware<Request, Response>({
      target: stockProxyValue.target,
      changeOrigin: true,
      secure: dopplerConfig === 'prd',
      proxyTimeout: MAX_PROXY_TIMEOUT,
      on: {
        proxyReq: onProxyReq,
      },
    }),
  );
  // ===========================<<< 리버스 프록시 설정 >>>=========================================

  // 쿠키 파서 미들웨어 설정
  // app.use(cookieParser(process.env.COOKIE_SECRET));
  // Rest 기본 설정
  app?.use(json({ limit: '10mb' }));
  app?.set('trust proxy', 1);
  app?.setGlobalPrefix(gatewayPrefix);
  app?.enableShutdownHooks();

  app.use(
    helmet({
      // CSP를 완전히 비활성화
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  // ----------------------------------------

  await app.listen(gatewayPort, '0.0.0.0');

  logger.log(
    `🚀 Application is running on: http://localhost:${gatewayPort}/${gatewayPrefix}`,
  );
}

/**
 * 메인 태스크 실행
 */
async function run(): Promise<void> {
  const logger = new Logger('GatewayMain');

  if (cluster.default.isPrimary) {
    const numCPUs = os.cpus().length;

    const maxWorkers = Math.min(numCPUs, 2);

    logger.log(
      `마스터 프로세스가 실행 중입니다. ${maxWorkers}개의 워커를 포크합니다.`,
    );

    // CPU 코어 수만큼 워커 생성
    for (let i = 0; i < maxWorkers; i++) {
      cluster.default.fork();
    }

    // 워커가 종료되면 새로운 워커를 생성 (빠른 연속 크래시 방지)
    const workerRestartTimes: number[] = [];
    cluster.default.on('exit', (worker, code, signal) => {
      logger.error(
        `워커 프로세스(${worker.process.pid})가 종료되었습니다. code=${code}, signal=${signal}`,
      );

      const now = Date.now();
      workerRestartTimes.push(now);
      // 최근 60초 내 5회 이상 재시작 시 중단
      const recentRestarts = workerRestartTimes.filter((t) => now - t < 60000);
      if (recentRestarts.length >= 5) {
        logger.error('워커가 60초 내 5회 이상 재시작됨. 새 워커 생성을 중단합니다.');
        return;
      }

      setTimeout(() => {
        logger.log('새 워커를 생성합니다.');
        cluster.default.fork();
      }, 1000);
    });

    return;
  } else {
    await bootstrap();
  }
}

run();
