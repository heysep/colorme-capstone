import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';
import { IsArray } from 'class-validator';

/**
 * 데이터 목록 전체 조회
 *
 * @author 최시훈
 */
export class IJsxcrudGetManyFullDto<T> {
  @ApiProperty({
    description: '데이터',
    isArray: true,
  })
  @IsArray()
  data: T[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function renameClass<TFunction extends Function>(cls: TFunction, name: string) {
  Object.defineProperty(cls, 'name', { value: name });
  return cls;
}

export function IJsxcrudGetManyFullDtoFactory<
  T extends abstract new (...options: any) => any,
>(ItemDto: T) {
  @ApiExtraModels(ItemDto)
  class IJsxcrudGetManyFullDto {
    @ApiProperty({
      type: () => ItemDto,
      isArray: true,
    })
    data: InstanceType<T>[];
  }
  renameClass(
    IJsxcrudGetManyFullDto,
    `IJsxcrudGetManyFullDto_${ItemDto.name}_${createId()}`,
  );
  return IJsxcrudGetManyFullDto;
}
