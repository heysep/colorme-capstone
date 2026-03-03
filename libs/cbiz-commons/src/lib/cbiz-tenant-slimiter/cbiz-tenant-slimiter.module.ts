import { GlbLogMxModule } from '@capstone-project/glb-commons';
import { Module } from '@nestjs/common';
import { CbizTenantSlimiterService } from './cbiz-tenant-slimiter.service';

@Module({
  imports: [
    /**
     * 로깅 모듈
     */
    GlbLogMxModule.forRoot({
      contextName: 'CBIZ-TENANT-SLIMITER',
      useInterceptor: false,
    }),
  ],
  providers: [CbizTenantSlimiterService],
  exports: [CbizTenantSlimiterService],
})
export class CbizTenantSlimiterModule {}
