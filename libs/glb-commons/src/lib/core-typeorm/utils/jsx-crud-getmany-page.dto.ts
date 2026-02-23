import { createId } from '@paralleldrive/cuid2';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

/**
 * 페이지네이션 정보
 *
 * @author 최시훈
 */
export class IJsxcrudGetManyPageDto<T> {
  @ApiProperty({ description: '데이터', isArray: true })
  @IsArray()
  data: T[];

  @ApiProperty({ description: '데이터 목록 총 개수' })
  @IsNumber()
  total: number;

  @ApiProperty({ description: '현재 페이지' })
  @IsNumber()
  page: number;

  @ApiProperty({ description: '페이지 개수' })
  @IsNumber()
  pageCount: number;

  @ApiProperty({ description: '현제 페이지에서 데이터 개수' })
  @IsNumber()
  count: number;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function renameClass<TFunction extends Function>(cls: TFunction, name: string) {
  Object.defineProperty(cls, 'name', { value: name });
  return cls;
}

/**
 * Swagger 전용 DTO Factory
 */
export function IJsxcrudGetManyPageDtoFactory<
  T extends abstract new (...options: any) => any,
>(ItemDto: T) {
  @ApiExtraModels(ItemDto)
  class IJsxcrudGetManyPageDto {
    @ApiProperty({
      type: () => ItemDto,
      isArray: true,
    })
    data: InstanceType<T>[];

    @ApiProperty({
      description: '데이터 목록 총 개수',
      type: Number,
      example: 100,
    })
    total: number;

    @ApiProperty({ description: '현재 페이지 번호', type: Number, example: 1 })
    page: number;

    @ApiProperty({ description: '페이지 총 개수', type: Number, example: 10 })
    pageCount: number;

    @ApiProperty({
      description: '현제 페이지에서 데이터 개수',
      type: Number,
      example: 10,
    })
    count: number;
  }

  renameClass(
    IJsxcrudGetManyPageDto,
    `IJsxcrudGetManyPageDto_${ItemDto.name}_${createId()}`,
  );
  return IJsxcrudGetManyPageDto;
}
