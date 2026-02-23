import { IsString } from './default-validator-with-swagger.decorator';

export const UUID_LENGTH = 36;

export function omitUndefined<T extends object>(src: Partial<T>): Partial<T> {
  return Object.fromEntries(
    Object.entries(src).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export const createBaseEntity = <
  T extends {
    id: any;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    [key: string]: any;
  },
>(
  entity: Partial<Pick<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>> &
    Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
): T => {
  const { id, createdAt, updatedAt, deletedAt, ...rest } = entity;

  const result = {
    // id, createdAt, updatedAt, deletedAt는 모두 생략 가능하므로
    // 실제 값이 없으면 그냥 undefined로 두고, rest(나머지 필드)만 올린다
    id: (id as any) ?? undefined,
    createdAt: (createdAt as Date) ?? undefined,
    updatedAt: (updatedAt as Date) ?? undefined,
    deletedAt: (deletedAt as Date) ?? undefined,
    ...rest,
  } as T;

  return result;
};

export class IdRefDto {
  @IsString({
    min: 1,
    max: UUID_LENGTH,
    propertyName: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID',
  })
  id: string;
}

export const ref = (entity: any) => {
  if (!entity) {
    return undefined;
  }
  return {
    id: entity.id ?? entity,
  } as any;
};

export type CreateDto<T, E extends keyof T = never> = Omit<
  T,
  E | 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type UpdateDto<T, E extends keyof T = never> = Omit<
  T,
  E | 'createdAt' | 'updatedAt' | 'deletedAt' | 'id'
>;

export class CreateManyDto<T> {
  bulk: T[];
}

export class UpdateManyDto<T> {
  bulk: (T & { id: string })[];
}

export class DeleteDto {
  id: string;
}

export type HistoryDto = {
  changeHistory: any;
};
