import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { createId } from '@paralleldrive/cuid2';

/**
 * 단일 데이터 생성 DTO
 *
 * @author 최시훈
 */
export class IJsxCrudCreateManyDto<T> {
  @ApiProperty({
    description: '생성된 엔티티',
  })
  data: T[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function renameClass<TFunction extends Function>(cls: TFunction, name: string) {
  Object.defineProperty(cls, 'name', { value: name });
  return cls;
}
export function IJsxCrudCreateManyDtoFactory<
  T extends abstract new (...options: any) => any,
>(ItemDto: T) {
  @ApiExtraModels(ItemDto)
  class IJsxCrudCreateManyDto {
    @ApiProperty({
      type: () => ItemDto,
      isArray: true,
    })
    data: InstanceType<T>[];
  }
  renameClass(
    IJsxCrudCreateManyDto,
    `IJsxCrudCreateManyDto_${ItemDto.name}_${createId()}`,
  );
  return IJsxCrudCreateManyDto;
}
