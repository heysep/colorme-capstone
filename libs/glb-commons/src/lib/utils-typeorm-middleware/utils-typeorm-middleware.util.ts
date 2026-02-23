import { MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { TenantMiddleware } from '../core-typeorm/middleware/tenant.middleware';

export class UtilTypeOrmMiddleware implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*rest', method: RequestMethod.ALL });
  }
}