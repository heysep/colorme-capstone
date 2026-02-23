import {
  GlbLogMxModule,
  TYPE_ORM_FOR_FEATURE,
  TYPE_ORM_FOR_FEATURE_SUBMYSQL,
} from '@drvalue-bmes-backend/glb-commons';
import { Module } from '@nestjs/common';
import { FileManagerDefaultController } from './controller/file-manager-default.controller';
import { FileManagerDownloadOnlyController } from './controller/file-manager-download-only.controller';
import { FileManagerForRootLoginUserController } from './controller/file-manager-for-root-login-user.controller';
import { FileManagerForTenantLoginUserController } from './controller/file-manager-for-tenant-login-user.controller';
import { FileManagerAutoDeleteCron } from './cron/file-manager-auto-delete.cron';

@Module({
  imports: [
    /**
     * 로깅 모듈
     */
    GlbLogMxModule.forRoot({
      contextName: 'SERVICE-FILE-MNG-CORE-FILE-MANAGER',
      useInterceptor: false,
    }),
    /**
     * TypeORM 모듈
     */
    TYPE_ORM_FOR_FEATURE,
    TYPE_ORM_FOR_FEATURE_SUBMYSQL,
  ],

  controllers: [
    FileManagerForRootLoginUserController,
    FileManagerForTenantLoginUserController,
    FileManagerDownloadOnlyController,
    FileManagerDefaultController,
  ],
  providers: [FileManagerAutoDeleteCron],
})
export class FileManagerModule {}
