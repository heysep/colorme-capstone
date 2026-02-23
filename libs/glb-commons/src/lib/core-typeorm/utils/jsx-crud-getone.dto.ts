import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';
import { IsObject } from 'class-validator';

/**
 * 단일 데이터 조회 DTO
 *
 * @author 최시훈
 */
export class IJsxcrudGetOneDto<T> {
  @ApiProperty({
    description: '데이터',
  })
  @IsObject()
  data: T;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function renameClass<TFunction extends Function>(cls: TFunction, name: string) {
  Object.defineProperty(cls, 'name', { value: name });
  return cls;
}

export function IJsxCrudGetOneDtoFactory<
  T extends abstract new (...options: any) => any,
>(ItemDto: T) {
  @ApiExtraModels(ItemDto)
  class IJsxcrudGetOneDto {
    @ApiProperty({
      type: () => ItemDto,
    })
    data: InstanceType<T>;
  }
  renameClass(
    IJsxcrudGetOneDto,
    `IJsxcrudGetOneDto_${ItemDto.name}_${createId()}`,
  );
  return IJsxcrudGetOneDto;
}
