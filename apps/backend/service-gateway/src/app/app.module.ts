import {
  GlbCoreTypeOrmModule,
  GlbLogMxModule,
  GlbRedisCoreModule,
} from '@capstone-project/glb-commons';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GatewayLogEventListener } from './listeners/gateway-log.listener';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    /**
     * Redis 모듈
     */
    GlbRedisCoreModule.forRoot({
      isGlobal: true,
    }),
    /**
     * TypeORM 모듈
     */
    GlbCoreTypeOrmModule.forRoot(),
    /**
     * 로깅 모듈
     */
    GlbLogMxModule.forRoot({
      contextName: 'API-GATEWAY',
      useInterceptor: true,
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [],
  providers: [GatewayLogEventListener],
})
export class AppModule {}
