/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { MainTaskUtil } from '@drvalue-bmes-backend/glb-commons';
import { AppModule } from './app/app.module';

async function bootstrap() {
  await MainTaskUtil.run({
    appModule: AppModule,
    envName: {
      apiPort: 'SERVICE_FILE_MNG_PORT',
      apiPrefix: 'SERVICE_FILE_MNG_PREFIX',
      apiVersion: 'SERVICE_FILE_MNG_VERSION',
      rabbitQueue: 'SERVICE_FILE_MNG_RABBITMQ_QUEUE',
      rabbitUrls: 'RABBITMQ_URLS',
      swaggerTitle: 'SERVICE_FILE_MNG API',
      swaggerDescription: 'SERVICE_FILE_MNG API 문서',
      swaggerVersion: '1.0.2',
    },
    isRunCluster: false,
  });
}

bootstrap();
