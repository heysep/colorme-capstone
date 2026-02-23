import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  ValidationPipe,
} from '@nestjs/common';

/**
 * 쿼리 파라미터에 대한 검증을 스킵하는 커스텀 ValidationPipe
 */
@Injectable()
export class QuerySkipValidationPipe
  extends ValidationPipe
  implements PipeTransform
{
  constructor(options?: any) {
    super(options);
  }

  transform(value: any, metadata: ArgumentMetadata) {
    // 쿼리 파라미터인 경우 검증을 스킵하고 값만 반환
    if (metadata.type === 'query') {
      return value;
    }

    // 쿼리가 아닌 경우 기존 ValidationPipe의 검증 수행
    return super.transform(value, metadata);
  }
}
