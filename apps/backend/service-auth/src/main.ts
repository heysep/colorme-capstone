/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { MainTaskUtil } from '@capstone-project/glb-commons';
import { AppModule } from './app/app.module';

async function bootstrap() {
  await MainTaskUtil.run({
    appModule: AppModule,
    envName: {
      apiPort: 'SERVICE_AUTH_PORT',
      apiPrefix: 'SERVICE_AUTH_PREFIX',
      apiVersion: 'SERVICE_AUTH_VERSION',
      rabbitQueue: 'SERVICE_AUTH_RABBITMQ_QUEUE',
      rabbitUrls: 'RABBITMQ_URLS',
      swaggerTitle: 'SERVICE_AUTH API',
      swaggerDescription: 'SERVICE_AUTH API 문서',
      swaggerVersion: '1.0.0',
    },
    isRunCluster: true,
  });
}

bootstrap();
