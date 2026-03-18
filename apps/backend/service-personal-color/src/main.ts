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
      apiPort: 'SERVICE_PERSONAL_COLOR_PORT',
      apiPrefix: 'SERVICE_PERSONAL_COLOR_PREFIX',
      apiVersion: 'SERVICE_PERSONAL_COLOR_VERSION',
      rabbitQueue: 'SERVICE_PERSONAL_COLOR_RABBITMQ_QUEUE',
      rabbitUrls: 'RABBITMQ_URLS',
      swaggerTitle: 'SERVICE_PERSONAL_COLOR API',
      swaggerDescription: 'SERVICE_PERSONAL_COLOR API 문서',
      swaggerVersion: '1.0.0',
    },
    isRunCluster: false,
  });
}

bootstrap();
