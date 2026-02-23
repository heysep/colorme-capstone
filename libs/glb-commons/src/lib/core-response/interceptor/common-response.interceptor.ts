import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { CommonResponseModuleOptions } from '../common-response.module';
import { IApiCommonResponse } from '../dto/api-common-response.dto';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  IApiCommonResponse<T>,
  IApiCommonResponse<T>
> {
  constructor(
    @Inject('CommonResponseModule.RootOptions')
    private readonly myOptions: CommonResponseModuleOptions,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<IApiCommonResponse<T>>,
  ): Observable<IApiCommonResponse<T>> {
    const type = context.getType<'http' | 'rpc' | 'ws'>();
    if (type !== 'http') {
      return next.handle();
    }

    // 제외 경로 확인
    // ----------------------------
    // 인터셉터에서 제외할 경로가 설정되어 있고 현재 요청 URL이 제외 경로에 포함되어 있는 경우
    // 인터셉터를 건너뛰고 다음 핸들러로 진행
    if (
      this.myOptions.excludePaths &&
      this.myOptions.excludePaths.length > 0 &&
      this.myOptions.excludePaths
        ?.map((path) => path.toLowerCase())
        .some((path) =>
          context.switchToHttp().getRequest().url?.toLowerCase().includes(path),
        )
    ) {
      return next.handle();
    }
    // ----------------------------

    // HTTP 요청 정보
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => {
        const result: IApiCommonResponse<T> = {
          ...data, // 컨트롤러에서 넘어온 모든 데이터를 그대로 유지
          timestamp: new Date().toISOString(), // 타임스탬프만 현재 시각으로 업데이트
          path: context.switchToHttp().getRequest().url, // 요청 URL 업데이트
          requestUser:
            !!request?.user && !!request?.user?.id
              ? {
                  id: request?.user?.id,
                  userId: request?.user?.userId,
                  userName: request?.user?.userName,
                }
              : null,
        };

        return result;
      }),
    );
  }
}
