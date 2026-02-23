import { GlbLogMxModule } from '@drvalue-bmes-backend/glb-commons';
import { Module } from '@nestjs/common';
import { TenantDefaultController } from './controller/tenant-default.controller';
import { TenantDefaultService } from './service/tenant-default.service';

@Module({
  imports: [
    GlbLogMxModule.forRoot({
      contextName: 'SERVICE-AUTH-CORE-TENANT',
      useInterceptor: false,
    }),
  ],
  controllers: [TenantDefaultController],
  providers: [TenantDefaultService],
})
export class TenantModule {}
