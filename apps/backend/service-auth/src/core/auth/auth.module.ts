import {
  GlbCoreAclModule,
  GlbLogMxModule,
} from '@drvalue-bmes-backend/glb-commons';
import { Module } from '@nestjs/common';
import { AuthLoginDefaultController } from './controller/auth-login-default.controller';
import { AuthMeDefaultController } from './controller/auth-me-default.controller';
import { EmployeeMappingAccountDefaultRepository } from './repository/employee-mapping-account-default.repository';
import { AuthLoginDefaultService } from './service/auth-login-default.service';
import { AuthMeDefaultService } from './service/auth-me-default.service';

@Module({
  imports: [
    GlbCoreAclModule.forRoot(),
    /**
     * 로깅 모듈
     */
    GlbLogMxModule.forRoot({
      contextName: 'SERVICE-AUTH-CORE-AUTH',
      useInterceptor: false,
    }),
  ],
  controllers: [AuthLoginDefaultController, AuthMeDefaultController],
  providers: [
    // Repository
    EmployeeMappingAccountDefaultRepository,

    // Service
    AuthLoginDefaultService,
    AuthMeDefaultService,
  ],
})
export class AuthModule {}
