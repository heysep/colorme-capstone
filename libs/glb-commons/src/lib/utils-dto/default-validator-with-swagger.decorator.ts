/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import {
  ClassConstructor,
  plainToInstance,
  Transform,
  Type,
} from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray as IsArrayValidator,
  IsBoolean as IsBooleanValidator,
  IsDate as IsDateValidator,
  IsEnum as IsEnumValidator,
  IsNotEmpty,
  IsNumber as IsNumberValidator,
  IsObject as IsObjectValidator,
  IsOptional,
  IsString as IsStringValidator,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { IdRefDto } from './default.utils';

function resolveExampleValue(value: unknown): unknown {
  if (typeof value === 'function') {
    return (value as () => unknown)();
  }
  return value;
}

function resolveSwaggerType(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value[0];
  }
  if (typeof value !== 'function') return value;
  if (
    value === String ||
    value === Number ||
    value === Boolean ||
    value === Date
  )
    return value;
  if ((value as Function).prototype) return value;
  try {
    const evaluated = (value as () => unknown)();
    if (Array.isArray(evaluated)) {
      return evaluated[0];
    }
    return evaluated;
  } catch {
    return value;
  }
}

function resolveClassType(value: unknown): ClassConstructor<any> | null {
  const resolved = resolveSwaggerType(value);
  if (
    typeof resolved === 'function' &&
    (resolved as Function).prototype &&
    resolved !== String &&
    resolved !== Number &&
    resolved !== Boolean &&
    resolved !== Date
  ) {
    return resolved as ClassConstructor<any>;
  }
  return null;
}

function buildExampleFromClass(
  dto: ClassConstructor<any>,
  visited = new Set<Function>(),
): Record<string, any> | undefined {
  if (visited.has(dto)) return undefined;
  visited.add(dto);

  const properties: string[] =
    Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, dto.prototype) ||
    [];
  const example: Record<string, any> = {};

  for (const rawKey of properties) {
    const propertyKey = rawKey.startsWith(':') ? rawKey.slice(1) : rawKey;
    const metadata = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      dto.prototype,
      propertyKey,
    ) as Record<string, any> | undefined;
    if (!metadata) continue;

    let value = resolveExampleValue(metadata['example']);
    if (value === undefined) {
      if (Array.isArray(metadata['enum']) && metadata['enum'].length > 0) {
        value = metadata['enum'][0];
      } else {
        const nestedClass = resolveClassType(metadata['type']);
        if (nestedClass) {
          value = buildExampleFromClass(nestedClass, visited);
        }
      }
    }

    if (value !== undefined) {
      example[propertyKey] = metadata['isArray']
        ? Array.isArray(value)
          ? value
          : [value]
        : value;
    }
  }

  visited.delete(dto);
  return Object.keys(example).length > 0 ? example : undefined;
}

function buildArrayExampleFromItemType(
  itemType?: ClassConstructor<any>,
): any[] | undefined {
  if (!itemType) return undefined;
  if (itemType === String) return ['string'];
  if (itemType === Number) return [0];
  if (itemType === Boolean) return [true];
  if (itemType === Date) return ['2024-01-01'];
  const exampleObject = buildExampleFromClass(itemType) ?? {};
  return [exampleObject];
}

export function IsNumber({
  propertyName,
  min,
  max,
  decimalPlaces,
  optional = false,
  example,
  description,
}: {
  propertyName: string;
  min?: number;
  max?: number;
  decimalPlaces?: number;
  optional?: boolean;
  example: any;
  description: string;
}): PropertyDecorator {
  return (target, propertyKey) => {
    IsNumberValidator(
      {
        maxDecimalPlaces: decimalPlaces,
        allowNaN: false,
        allowInfinity: false,
      },
      {
        message: `${propertyName}는(은) 숫자여야 합니다.`,
      },
    )(target, propertyKey as string);
    if (!optional) {
      IsNotEmpty({
        message: `${propertyName}는(은) 비어 있으면 안 됩니다.`,
      })(target, propertyKey as string);
    } else {
      IsOptional({
        always: true,
      })(target, propertyKey as string);
    }
    if (min !== undefined) {
      Min(min, {
        message: `${propertyName}는(은) ${min} 이상이어야 합니다.`,
      })(target, propertyKey as string);
    }
    if (max !== undefined) {
      Max(max, {
        message: `${propertyName}는(은) ${max} 이하이어야 합니다.`,
      })(target, propertyKey as string);
    }
    ApiProperty({
      description,
      example,
      ...(min !== undefined && { minimum: min }),
      ...(max !== undefined && { maximum: max }),
      type: Number,
      required: !optional,
    })(target, propertyKey as string);
  };
}

export function IsString({
  min,
  max,
  propertyName,
  example,
  description,
  optional = false,
}: {
  min: number;
  max: number;
  propertyName: string;
  example: any;
  description: string;
  optional?: boolean;
}): PropertyDecorator {
  return (target, propertyKey) => {
    IsStringValidator({
      message: `${propertyName}는(은) 문자열이어야 합니다.`,
    })(target, propertyKey as string);
    if (!optional) {
      IsNotEmpty({
        message: `${propertyName}는(은) 비어 있으면 안 됩니다.`,
      })(target, propertyKey as string);
    } else {
      IsOptional({
        always: true,
      })(target, propertyKey as string);
    }
    Length(min, max, {
      message: `${propertyName}는(은) ${min}~${max}자 사이여야 합니다.`,
    })(target, propertyKey as string);
    ApiProperty({
      description,
      example,
      ...(min !== undefined && { minLength: min }),
      ...(max !== undefined && { maxLength: max }),
      type: String,
      required: !optional,
    })(target, propertyKey as string);
  };
}

export function IsDate({
  propertyName,
  example,
  description,
  optional = false,
}: {
  propertyName: string;
  example: any;
  description: string;
  optional?: boolean;
}): PropertyDecorator {
  return (target, propertyKey) => {
    IsDateValidator({
      message: `${propertyName}는(은) 날짜여야 합니다.`,
    })(target, propertyKey as string);
    if (!optional) {
      IsNotEmpty({
        message: `${propertyName}는(은) 비어 있으면 안 됩니다.`,
      })(target, propertyKey as string);
    } else {
      IsOptional({
        always: true,
      })(target, propertyKey as string);
    }
    ApiProperty({
      description,
      example,
      type: Date,
      required: !optional,
    })(target, propertyKey as string);
  };
}

export function IsBoolean({
  propertyName,
  example,
  description,
  optional = false,
}: {
  propertyName: string;
  example: any;
  description: string;
  optional?: boolean;
}): PropertyDecorator {
  return (target, propertyKey) => {
    IsBooleanValidator({
      message: `${propertyName}는(은) 불리언이어야 합니다.`,
    })(target, propertyKey as string);
    if (!optional) {
      IsNotEmpty({
        message: `${propertyName}는(은) 비어 있으면 안 됩니다.`,
      })(target, propertyKey as string);
    } else {
      IsOptional({
        always: true,
      })(target, propertyKey as string);
    }
    ApiProperty({
      description,
      example,
      type: Boolean,
      required: !optional,
    })(target, propertyKey as string);
  };
}

export function IsArray({
  propertyName,
  minSize,
  maxSize,
  itemType,
  enumType,
  example,
  description,
  optional = false,
}: {
  propertyName: string;
  minSize?: number;
  maxSize?: number;
  itemType?: ClassConstructor<any>;
  enumType?: Record<string, any>;
  example?: any;
  description: string;
  optional?: boolean;
}): PropertyDecorator {
  return (target, propertyKey) => {
    const primitives = [String, Number, Boolean, Date];
    const resolvedItemType = resolveSwaggerType(itemType);
    const resolvedItemIsFunction = typeof resolvedItemType === 'function';
    const isResolvedPrimitive = primitives.includes(resolvedItemType as any);
    if (itemType && enumType) {
      throw new Error('itemType과 enumType은 동시에 사용할 수 없습니다.');
    }
    // 타입 체크
    IsArrayValidator({
      message: `${propertyName}는(은) 배열이어야 합니다.`,
    })(target, propertyKey as string);

    // 필수 여부
    if (!optional) {
      IsNotEmpty({ message: `${propertyName}는(은) 비어 있으면 안 됩니다.` })(
        target,
        propertyKey as string,
      );
    } else {
      IsOptional({ always: true })(target, propertyKey as string);
    }

    // 길이 제약
    if (typeof minSize === 'number') {
      ArrayMinSize(minSize, {
        message: `${propertyName} 배열은 최소 ${minSize}개 이상이어야 합니다.`,
      })(target, propertyKey as string);
    }
    if (typeof maxSize === 'number') {
      ArrayMaxSize(maxSize, {
        message: `${propertyName} 배열은 최대 ${maxSize}개 이하여야 합니다.`,
      })(target, propertyKey as string);
    }

    if (resolvedItemIsFunction) {
      // 변환
      Type(() => resolvedItemType as ClassConstructor<any>)(
        target,
        propertyKey as string,
      );

      if (!isResolvedPrimitive) {
        ApiExtraModels(resolvedItemType as ClassConstructor<any>)(
          target.constructor,
        );
        // 객체 배열일 때만 중첩 검증
        ValidateNested({ each: true })(target, propertyKey as string);
      } else {
        switch (resolvedItemType) {
          case String:
            IsStringValidator({
              each: true,
              message: `${propertyName} 항목은 문자열이어야 합니다.`,
            })(target, propertyKey as string);
            break;
          case Number:
            IsNumberValidator(
              {
                allowNaN: false,
                allowInfinity: false,
              },
              {
                each: true,
                message: `${propertyName} 항목은 숫자여야 합니다.`,
              },
            )(target, propertyKey as string);
            break;
          case Boolean:
            IsBooleanValidator({
              each: true,
              message: `${propertyName} 항목은 true/false여야 합니다.`,
            })(target, propertyKey as string);
            break;
          case Date:
            IsDateValidator({
              each: true,
              message: `${propertyName} 항목은 날짜여야 합니다.`,
            })(target, propertyKey as string);
            break;
        }
      }
    }
    if (enumType) {
      IsEnumValidator(enumType, {
        each: true,
        message: `${propertyName}에 허용되지 않은 값이 있습니다.`,
      })(target, propertyKey as string);
    }
    const resolvedExample =
      example === undefined
        ? buildArrayExampleFromItemType(
            resolvedItemIsFunction
              ? (resolvedItemType as ClassConstructor<any>)
              : undefined,
          )
        : example;
    const apiOptions: ApiPropertyOptions = {
      description,
      ...(resolvedExample !== undefined && { example: resolvedExample }),
      required: !optional,
      ...(minSize !== undefined && { minItems: minSize }),
      ...(maxSize !== undefined && { maxItems: maxSize }),
      isArray: true, // 핵심: 배열임을 명시
    };

    if (enumType) {
      // ✅ enum 배열
      apiOptions.enum = enumType;
      // apiOptions.type 지정 불필요(지정해도 되지만 enum이 우선)
    } else if (resolvedItemIsFunction) {
      if (isResolvedPrimitive) {
        // ✅ 프리미티브 배열
        apiOptions.type = resolvedItemType as any; // String | Number | Boolean
      } else if ((resolvedItemType as Function).name) {
        // ✅ 객체(DTO) 배열
        // 함수 래핑 형태가 가장 안전 (순환 참조/로드 순서 대응)
        const type = () => resolvedItemType as ClassConstructor<any>;
        apiOptions.type = type;
      } else {
        apiOptions.type = Object;
      }
    } else {
      apiOptions.type = Object;
    }

    ApiProperty(apiOptions)(target, propertyKey as string);
  };
}

export function IsObject({
  propertyName,
  type,
  optional = false,
  ref = false,
  example,
  description,
}: {
  propertyName: string;
  type?: ClassConstructor<any>;
  optional?: boolean;
  ref?: boolean;
  example?: any;
  description: string;
}): PropertyDecorator {
  return (target, propertyKey) => {
    IsObjectValidator({
      message: `${propertyName}는(은) 객체여야 합니다.`,
    })(target, propertyKey as string);

    if (!optional) {
      IsNotEmpty({ message: `${propertyName}는(은) 비어 있으면 안 됩니다.` })(
        target,
        propertyKey as string,
      );
    } else {
      IsOptional({ always: true })(target, propertyKey as string);
    }

    if (ref) {
      Transform(
        ({ value }) => plainToInstance(IdRefDto, { id: value }), // 문자열 → DTO 인스턴스
        { toClassOnly: true },
      );

      ValidateNested()(target, propertyKey as string);
    } else if (type) {
      Type(() => type)(target, propertyKey as string);
      ValidateNested()(target, propertyKey as string);
    }
    const resolvedClassType = resolveClassType(type);
    const resolvedExample =
      example === undefined && resolvedClassType
        ? buildExampleFromClass(resolvedClassType) ?? {}
        : example;
    ApiProperty({
      description,
      ...(resolvedExample !== undefined && { example: resolvedExample }),
      required: !optional,
      type: type,
    })(target, propertyKey as string);
  };
}

export function IsRef({
  propertyName,
  example,
  description,
  optional = false,
}: {
  propertyName: string;
  optional?: boolean;
  example: any;
  description: string;
}): PropertyDecorator {
  return (target, propertyKey) => {
    Transform(
      ({ value }) =>
        typeof value === 'string'
          ? plainToInstance(IdRefDto, { id: value })
          : value,
      { toClassOnly: true },
    )(target, propertyKey as string);
    // ValidateNested()(target, propertyKey as string);
    if (!optional) {
      IsNotEmpty({ message: `${propertyName}는(은) 비어 있으면 안 됩니다.` })(
        target,
        propertyKey as string,
      );
    } else {
      IsOptional({ always: true })(target, propertyKey as string);
    }
    ApiProperty({
      description,
      example,
      required: !optional,
      type: String,
    })(target, propertyKey as string);
  };
}

export function IsEnumValue<E extends Record<string, any>>(
  enumType: E,
  {
    propertyName,
    example,
    description,
    optional = false,
  }: {
    propertyName: string;
    example: any;
    description: string;
    optional?: boolean;
  },
): PropertyDecorator {
  return (target, propertyKey) => {
    IsEnumValidator(enumType, {
      message: `${propertyName}는(은) 허용되지 않은 값입니다.`,
    })(target, propertyKey as string);

    if (!optional) {
      IsNotEmpty({ message: `${propertyName}는(은) 비어 있으면 안 됩니다.` })(
        target,
        propertyKey as string,
      );
    } else {
      IsOptional({ always: true })(target, propertyKey as string);
    }
    ApiProperty({
      description,
      example,
      required: !optional,
      enum: enumType,
    })(target, propertyKey as string);
  };
}

export function getDisallowedKeys<
  T extends object,
  K extends readonly (keyof T)[],
>(obj: T, allowed: K) {
  return (Object.keys(obj) as (keyof T)[])
    .filter(
      (key): key is Exclude<keyof T, K[number]> =>
        !allowed.includes(key as K[number]),
    )
    .filter((key) => key !== 'changeHistory');
}
