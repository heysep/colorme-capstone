/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamicModule, Module } from '@nestjs/common';
import { NestMinioModule } from 'nestjs-minio';
import { ObjectStorageUploadService } from './service/object-storage-upload.service';
import { GlbLogMxModule } from '../utils-log-mx/log-mx.module';
import { ObjectStorageBucketService } from './service/object-storage-bucket.service';
import { ObjectStorageDownloadService } from './service/object-storage-download.service';
import { ObjectStorageCheckService } from './service/object-storage-check.service';
import { ObjectStorageDeleteService } from './service/object-storage-delete.service';
import {
  TYPE_ORM_FOR_FEATURE,
  TYPE_ORM_FOR_FEATURE_SUBMYSQL,
} from '../core-typeorm/core-typeorm.module';

@Module({})
export class GlbCoreMinioModule {
  static forRoot(): DynamicModule {
    const minioHost = process?.env?.['HAPROXY_MINIO_HOST'] as any;
    if (!minioHost) {
      throw new Error('GlbCoreMinioModule - HAPROXY_MINIO_HOST is not set');
    }

    const minioPort = process?.env?.['HAPROXY_MINIO_PORT'] as any;
    if (!minioPort) {
      throw new Error('GlbCoreMinioModule - HAPROXY_MINIO_PORT is not set');
    }

    const minioAccessKey = process?.env?.['HAPROXY_MINIO_ACCESS_KEY'] as any;
    if (!minioAccessKey) {
      throw new Error(
        'GlbCoreMinioModule - HAPROXY_MINIO_ACCESS_KEY is not set',
      );
    }

    const minioSecretKey = process?.env?.['HAPROXY_MINIO_SECRET_KEY'] as any;
    if (!minioSecretKey) {
      throw new Error(
        'GlbCoreMinioModule - HAPROXY_MINIO_SECRET_KEY is not set',
      );
    }

    return {
      module: GlbCoreMinioModule,
      global: true,
      imports: [
        TYPE_ORM_FOR_FEATURE,
        TYPE_ORM_FOR_FEATURE_SUBMYSQL,
        // -----------
        GlbLogMxModule.forRoot({
          contextName: 'GlbCoreMinioModule',
          useInterceptor: false,
        }),
        // -----------
        NestMinioModule.register({
          isGlobal: true,
          endPoint: minioHost,
          ...(minioPort === 'NaN' ? {} : { port: minioPort }),
          useSSL: false,
          accessKey: minioAccessKey,
          secretKey: minioSecretKey,
        }),
      ],
      providers: [
        ObjectStorageUploadService,
        ObjectStorageDownloadService,
        ObjectStorageBucketService,
        ObjectStorageCheckService,
        ObjectStorageDeleteService,
      ],
      exports: [
        ObjectStorageUploadService,
        ObjectStorageDownloadService,
        ObjectStorageCheckService,
        ObjectStorageDeleteService,
      ],
    };
  }
}
