import { CrudRequestInterceptor } from '@dataui/crud';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiProperty,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { ClassConstructor } from 'class-transformer';
import {
  OnlyRootUserDb,
  OnlyTenantUserDb,
} from '../core-acl/decorator/only-db.decorator';
import { JwtGuard } from '../core-acl/guard/jwt.guard';
import { IApiCommonRequestUser } from '../core-response/dto/api-common-response.dto';
import { IsNumber } from '../utils-dto/default-validator-with-swagger.decorator';

// 적용일과 useYn 관련된 쿼리
export function ApiApplyDateAndUseYnFilter({
  applyDateFilter = true,
  useYnFilter = true,
}: {
  applyDateFilter?: boolean;
  useYnFilter?: boolean;
}): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    if (applyDateFilter) {
      ApiQuery({
        name: 'applyDateFilter',
        description: '적용일',
        required: false,
      })(target, propertyKey, descriptor);
    }
    if (useYnFilter) {
      ApiQuery({
        name: 'useYnFilter',
        description: '사용여부',
        required: false,
      })(target, propertyKey, descriptor);
    }
  };
}

export function ApiPagination(): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    ApiQuery({
      name: 'page',
      description: '페이지',
      required: false,
    })(target, propertyKey, descriptor);
    ApiQuery({
      name: 'limit',
      description: '한 페이지에 보여지는 개수',
      required: false,
    })(target, propertyKey, descriptor);
  };
}

export class ApiPaginationDto {
  @IsNumber({
    propertyName: 'page',
    example: 1,
    description: '페이지',
    optional: true,
    min: 1,
  })
  page?: number;

  @IsNumber({
    propertyName: 'limit',
    example: 10,
    description: '한 페이지에 보여지는 개수',
    optional: true,
    min: 1,
  })
  limit?: number;
}

export function ApiGuard({
  onlyRootDb = false,
}: {
  onlyRootDb?: boolean;
}): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    UseGuards(JwtGuard)(target, propertyKey, descriptor);
    if (onlyRootDb) {
      OnlyRootUserDb()(target, propertyKey, descriptor);
    } else {
      OnlyTenantUserDb()(target, propertyKey, descriptor);
    }
  };
}

export function ApiDefaultHeaders({
  withTenantCode = true,
  withJwtToken = true,
}: {
  withTenantCode?: boolean;
  withJwtToken?: boolean;
}): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    if (withTenantCode) {
      ApiHeader({
        name: 'x-tenant-code',
        description: '테넌트 코드',
        required: true,
      })(target, propertyKey, descriptor);
    }
    if (withJwtToken) {
      ApiBearerAuth('jwt-token')(target, propertyKey, descriptor);
    }
  };
}

export class SwaggerResponseDto<T> {
  @ApiProperty({
    description: '데이터',
    type: Object,
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: '결과 코드',
    type: String,
  })
  resultCode: string;

  @ApiProperty({
    description: '타임스탬프',
    type: String,
  })
  timestamp: string;

  @ApiProperty({
    description: '경로',
    type: String,
  })
  path: string;

  @ApiProperty({
    description: '요청 사용자',
    type: IApiCommonRequestUser,
  })
  requestUser: IApiCommonRequestUser;
}

// 공통 유틸: 클래스 name 주입
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function renameClass<TFunction extends Function>(cls: TFunction, name: string) {
  Object.defineProperty(cls, 'name', { value: name });
  return cls;
}

export function ComposeSwaggerDataDtoWithPagination<
  T extends ClassConstructor<any>,
>(EntityClass: T) {
  const WithFront = ComposeSwaggerDataDto(EntityClass);

  class PaginationDto {
    @ApiProperty({ isArray: true, type: () => WithFront })
    data: InstanceType<typeof WithFront>[];

    @ApiProperty({ type: Number, description: '총 개수' })
    total: number;
  }

  renameClass(PaginationDto, `Paginated${EntityClass.name}`);

  return PaginationDto as unknown as ClassConstructor<InstanceType<T>>;
}

export function ComposeSwaggerDataDto<T extends ClassConstructor<any>>(
  EntityClass: T,
) {
  const WithFront = EntityClass;
  return WithFront as unknown as ClassConstructor<InstanceType<T>>;
}

export function SwaggerSchema(
  dto:
    | ClassConstructor<any>
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor,
) {
  const isPrimitive = dto === String || dto === Number || dto === Boolean;
  const dataSchema = isPrimitive
    ? {
        type: dto === String ? 'string' : dto === Number ? 'number' : 'boolean',
      }
    : { $ref: getSchemaPath(dto as ClassConstructor<any>) };

  return {
    allOf: [
      { $ref: getSchemaPath(SwaggerResponseDto) },
      {
        properties: {
          data: dataSchema,
        },
      },
    ],
  };
}

export type ApiResponseExampleValue = any;

export interface ApiResponseExclude {
  [key: string]: true | ApiResponseExclude;
}

export interface ApiResponseInclude {
  [key: string]: true | ApiResponseInclude;
}

// 인라인 스키마 인터페이스 정의 (순환 참조 허용)
export interface InlineSchema {
  [key: string]:
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | ClassConstructor<any>
    | InlineSchema;
}

export type ApiResponsePrimitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Date;

export type UnwrapArray<T> = T extends Array<infer U> ? U : T;

export type ApiResponseExcludeValue<T> = T extends ApiResponsePrimitive
  ? true
  : T extends Array<infer U>
    ? ApiResponseExcludeValue<U>
    : T extends object
      ? ApiResponseExcludeFor<T>
      : true;

export type ApiResponseExcludeFor<T extends object> = {
  [K in keyof T]?: true | ApiResponseExcludeValue<T[K]>;
};

export type InlineSchemaValueToType<T> = T extends StringConstructor
  ? string
  : T extends NumberConstructor
    ? number
    : T extends BooleanConstructor
      ? boolean
      : T extends ClassConstructor<infer U>
        ? U
        : T extends InlineSchema
          ? InlineSchemaToType<T>
          : unknown;

export type InlineSchemaToType<S extends InlineSchema> = {
  [K in keyof S]: InlineSchemaValueToType<S[K]>;
};

export type ApiResponseExampleType =
  | ClassConstructor<any>
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | InlineSchema
  | null;

export type ApiResponseInstanceFromType<T> = T extends StringConstructor
  ? string
  : T extends NumberConstructor
    ? number
    : T extends BooleanConstructor
      ? boolean
      : T extends ClassConstructor<infer U>
        ? U
        : T extends InlineSchema
          ? InlineSchemaToType<T>
          : T extends null
            ? null
            : unknown;

export type ApiResponseExcludeTarget<T> = T extends { data: infer D }
  ? UnwrapArray<D>
  : T;

export type ApiResponseExcludeType<T> =
  | (T extends object ? ApiResponseExcludeFor<T> : ApiResponseExclude)
  | (ApiResponseExcludeTarget<T> extends object
      ? ApiResponseExcludeFor<ApiResponseExcludeTarget<T>>
      : ApiResponseExclude);

export type ApiResponseIncludeValue<T> = ApiResponseExcludeValue<T>;

export type ApiResponseIncludeFor<T extends object> = {
  [K in keyof T]?: true | ApiResponseIncludeValue<T[K]>;
};

export type ApiResponseIncludeTarget<T> = ApiResponseExcludeTarget<T>;

export type ApiResponseIncludeType<T> =
  | (T extends object ? ApiResponseIncludeFor<T> : ApiResponseInclude)
  | (ApiResponseIncludeTarget<T> extends object
      ? ApiResponseIncludeFor<ApiResponseIncludeTarget<T>>
      : ApiResponseInclude);

type ApiResponseExampleItemBase<
  TType extends ApiResponseExampleType = ApiResponseExampleType,
> = {
  type: TType;
  exampleName: string;
  example?: ApiResponseExampleValue;
};

export type ApiResponseExampleItem<
  TType extends ApiResponseExampleType = ApiResponseExampleType,
> = ApiResponseExampleItemBase<TType> &
  (
    | {
        exclude?: ApiResponseExcludeType<ApiResponseInstanceFromType<TType>>;
        include?: never;
      }
    | {
        include?: ApiResponseIncludeType<ApiResponseInstanceFromType<TType>>;
        exclude?: never;
      }
  );

// 인라인 스키마를 Swagger JSON Schema로 변환하는 함수
function buildInlineSchema(
  schema: InlineSchema,
  exclude?: ApiResponseExclude,
  include?: ApiResponseInclude,
  visited = new Set<Function>(),
): object {
  const properties: Record<string, any> = {};
  const propertyKeys = Object.keys(schema);
  const effectiveInclude = resolveIncludeForProperties(include, propertyKeys);
  const effectiveExclude = include
    ? undefined
    : resolveExcludeForProperties(exclude, propertyKeys);

  for (const [key, value] of Object.entries(schema)) {
    const propertyInclude = effectiveInclude?.[key] as
      | ApiResponseInclude
      | true
      | undefined;
    if (effectiveInclude && !propertyInclude) {
      continue;
    }
    const propertyExclude = effectiveExclude?.[key] as
      | ApiResponseExclude
      | true
      | undefined;
    if (propertyExclude === true) {
      continue;
    }
    const nestedInclude =
      propertyInclude && typeof propertyInclude === 'object'
        ? propertyInclude
        : undefined;
    const nestedExclude =
      propertyExclude && typeof propertyExclude === 'object'
        ? propertyExclude
        : undefined;
    if (value === String) {
      properties[key] = { type: 'string' };
    } else if (value === Number) {
      properties[key] = { type: 'number' };
    } else if (value === Boolean) {
      properties[key] = { type: 'boolean' };
    } else if (
      typeof value === 'object' &&
      value !== null &&
      Object.getPrototypeOf(value) === Object.prototype
    ) {
      // 중첩 객체 (클래스가 아닌 plain object)
      properties[key] = buildInlineSchema(
        value as InlineSchema,
        nestedExclude as ApiResponseExclude | undefined,
        nestedInclude as ApiResponseInclude | undefined,
        visited,
      );
    } else {
      // ClassConstructor - $ref 사용
      properties[key] = buildDataSchemaFromType(
        value as ClassConstructor<any>,
        nestedExclude as ApiResponseExclude | undefined,
        nestedInclude as ApiResponseInclude | undefined,
        visited,
      );
    }
  }

  return { type: 'object', properties };
}

// 인라인 스키마인지 판별하는 함수
function isInlineSchema(value: unknown): value is InlineSchema {
  if (typeof value !== 'object' || value === null) return false;
  // primitive 생성자는 제외
  if (value === String || value === Number || value === Boolean) return false;
  // 클래스(prototype이 있는 함수)는 제외
  if (typeof value === 'function') return false;
  // plain object인 경우
  return Object.getPrototypeOf(value) === Object.prototype;
}

const DEFAULT_RESPONSE_EXAMPLE_META = {
  resultCode: 'OK_0000',
  timestamp: '2024-01-01T00:00:00.000Z',
  path: '/',
  requestUser: {
    id: '1',
    userName: 'test',
    userId: 'test',
  },
};

function isPlainObject(value: unknown): value is Record<string, any> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function isResponseExample(value: unknown): value is ApiResponseExampleValue {
  if (!isPlainObject(value)) return false;
  return (
    'resultCode' in value ||
    'timestamp' in value ||
    'path' in value ||
    'requestUser' in value
  );
}

function wrapResponseExample(data: unknown): ApiResponseExampleValue {
  return {
    ...DEFAULT_RESPONSE_EXAMPLE_META,
    data,
  };
}

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
  if (value.prototype) return value;
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

function resolveExcludeForProperties(
  exclude: ApiResponseExclude | undefined,
  propertyKeys: string[],
): ApiResponseExclude | undefined {
  if (!exclude) return undefined;
  const hasMatch = Object.keys(exclude).some((key) =>
    propertyKeys.includes(key),
  );
  if (!hasMatch && propertyKeys.includes('data')) {
    return { data: exclude };
  }
  return exclude;
}

function resolveIncludeForProperties(
  include: ApiResponseInclude | undefined,
  propertyKeys: string[],
): ApiResponseInclude | undefined {
  if (!include) return undefined;
  const hasMatch = Object.keys(include).some((key) =>
    propertyKeys.includes(key),
  );
  if (!hasMatch && propertyKeys.includes('data')) {
    return { data: include };
  }
  return include;
}

function resolveClassType(type: unknown): ClassConstructor<any> | null {
  const resolved = resolveSwaggerType(type);
  if (
    typeof resolved === 'function' &&
    resolved.prototype &&
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
): ApiResponseExampleValue | undefined {
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

function applyExcludeToExampleValue(
  value: ApiResponseExampleValue,
  exclude?: ApiResponseExclude,
): ApiResponseExampleValue {
  if (!exclude) return value;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((item) => applyExcludeToExampleValue(item, exclude));
  }

  const record = value as Record<string, any>;
  const keys = Object.keys(record);
  const effectiveExclude = resolveExcludeForProperties(exclude, keys);
  const result: Record<string, any> = {};

  for (const [key, val] of Object.entries(record)) {
    const propertyExclude = effectiveExclude?.[key] as
      | ApiResponseExclude
      | true
      | undefined;
    if (propertyExclude === true) {
      continue;
    }
    if (propertyExclude && typeof propertyExclude === 'object') {
      result[key] = applyExcludeToExampleValue(val, propertyExclude);
    } else {
      result[key] = val;
    }
  }

  return result;
}

function applyIncludeToExampleValue(
  value: ApiResponseExampleValue,
  include?: ApiResponseInclude,
): ApiResponseExampleValue {
  if (!include) return value;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((item) => applyIncludeToExampleValue(item, include));
  }

  const record = value as Record<string, any>;
  const keys = Object.keys(record);
  const effectiveInclude = resolveIncludeForProperties(include, keys);
  if (!effectiveInclude) return value;
  const result: Record<string, any> = {};

  for (const [key, val] of Object.entries(record)) {
    const propertyInclude = effectiveInclude?.[key] as
      | ApiResponseInclude
      | true
      | undefined;
    if (!propertyInclude) {
      continue;
    }
    if (propertyInclude === true) {
      result[key] = val;
      continue;
    }
    if (propertyInclude && typeof propertyInclude === 'object') {
      result[key] = applyIncludeToExampleValue(val, propertyInclude);
    } else {
      result[key] = val;
    }
  }

  return result;
}

function resolveResponseExample(
  example: ApiResponseExampleValue | undefined,
): ApiResponseExampleValue | undefined {
  if (example === undefined) return undefined;
  return isResponseExample(example) ? example : wrapResponseExample(example);
}

function buildResponseExampleFromClass(
  dto: ClassConstructor<any>,
  exclude?: ApiResponseExclude,
  include?: ApiResponseInclude,
): ApiResponseExampleValue | undefined {
  const dataExample = buildExampleFromClass(dto, new Set<Function>());
  if (dataExample === undefined) return undefined;
  const prunedExample = include
    ? applyIncludeToExampleValue(dataExample, include)
    : applyExcludeToExampleValue(dataExample, exclude);
  return wrapResponseExample(prunedExample);
}

function buildDataSchemaFromType(
  type:
    | ClassConstructor<any>
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | InlineSchema
    | null,
  exclude?: ApiResponseExclude,
  include?: ApiResponseInclude,
  visited = new Set<Function>(),
): object {
  const resolved = resolveSwaggerType(type);
  if (resolved === null) {
    return { nullable: true, example: null };
  }
  if (isInlineSchema(resolved)) {
    return buildInlineSchema(
      resolved,
      include ? undefined : exclude,
      include,
      visited,
    );
  }
  if (resolved === String || resolved === Number || resolved === Boolean) {
    return {
      type:
        resolved === String
          ? 'string'
          : resolved === Number
            ? 'number'
            : 'boolean',
    };
  }
  if (resolved === Date) {
    return { type: 'string', format: 'date-time' };
  }
  if (typeof resolved === 'function' && resolved.prototype) {
    if (include) {
      return buildSchemaFromClass(
        resolved as ClassConstructor<any>,
        undefined,
        include,
        visited,
      );
    }
    if (exclude) {
      return buildSchemaFromClass(
        resolved as ClassConstructor<any>,
        exclude,
        undefined,
        visited,
      );
    }
    return { $ref: getSchemaPath(resolved as ClassConstructor<any>) };
  }
  return { type: 'object' };
}

function buildSchemaFromClass(
  dto: ClassConstructor<any>,
  exclude: ApiResponseExclude | undefined,
  include: ApiResponseInclude | undefined,
  visited = new Set<Function>(),
): object {
  if (visited.has(dto)) return { type: 'object' };
  visited.add(dto);

  const rawProperties: string[] =
    Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES_ARRAY, dto.prototype) ||
    [];
  const propertyKeys = rawProperties.map((rawKey) =>
    rawKey.startsWith(':') ? rawKey.slice(1) : rawKey,
  );
  const effectiveInclude = resolveIncludeForProperties(include, propertyKeys);
  const effectiveExclude = include
    ? undefined
    : resolveExcludeForProperties(exclude, propertyKeys);
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const rawKey of rawProperties) {
    const propertyKey = rawKey.startsWith(':') ? rawKey.slice(1) : rawKey;
    const metadata = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      dto.prototype,
      propertyKey,
    ) as Record<string, any> | undefined;
    if (!metadata) continue;

    const propertyInclude = effectiveInclude?.[propertyKey] as
      | ApiResponseInclude
      | true
      | undefined;
    if (effectiveInclude && !propertyInclude) {
      continue;
    }
    const propertyExclude = effectiveExclude?.[propertyKey] as
      | ApiResponseExclude
      | true
      | undefined;
    if (propertyExclude === true) {
      continue;
    }

    const nestedInclude =
      propertyInclude && typeof propertyInclude === 'object'
        ? propertyInclude
        : undefined;
    const nestedExclude =
      propertyExclude && typeof propertyExclude === 'object'
        ? propertyExclude
        : undefined;
    const isArray = metadata['isArray'] === true;
    const itemSchema = buildDataSchemaFromType(
      metadata['type'],
      nestedExclude as ApiResponseExclude | undefined,
      nestedInclude as ApiResponseInclude | undefined,
      visited,
    );
    const schema = isArray ? { type: 'array', items: itemSchema } : itemSchema;

    if (Array.isArray(metadata['enum']) && !('$ref' in schema)) {
      (schema as Record<string, any>).enum = metadata['enum'];
      if (!(schema as Record<string, any>).type) {
        const enumValue = metadata['enum'][0];
        (schema as Record<string, any>).type =
          typeof enumValue === 'number' ? 'number' : 'string';
      }
    }

    if (typeof metadata['description'] === 'string' && !('$ref' in schema)) {
      (schema as Record<string, any>).description = metadata['description'];
    }

    if (metadata['required'] === true) {
      required.push(propertyKey);
    }

    properties[propertyKey] = schema;
  }

  visited.delete(dto);

  return {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

function buildSwaggerSchemaForExampleTypes(examples: ApiResponseExampleItem[]) {
  const dataSchemas = examples.map((item) =>
    buildDataSchemaFromType(item.type, item.exclude, item.include),
  );
  const dataSchema =
    dataSchemas.length > 1 ? { oneOf: dataSchemas } : dataSchemas[0];

  return {
    allOf: [
      { $ref: getSchemaPath(SwaggerResponseDto) },
      {
        properties: {
          data: dataSchema,
        },
      },
    ],
  };
}

function buildResponseExamples(
  examples: ApiResponseExampleItem[],
): Record<string, { summary: string; value: ApiResponseExampleValue }> {
  const responseExamples: Record<
    string,
    { summary: string; value: ApiResponseExampleValue }
  > = {};

  examples.forEach((item, index) => {
    const key = item.exampleName?.trim() || `example${index + 1}`;
    let responseExample = resolveResponseExample(item.example);
    if (!responseExample) {
      const dtoClass = resolveClassType(item.type);
      if (dtoClass) {
        responseExample = buildResponseExampleFromClass(
          dtoClass,
          item.exclude,
          item.include,
        );
      }
      if (!responseExample && resolveSwaggerType(item.type) === null) {
        responseExample = wrapResponseExample(null);
      }
    }
    if (responseExample) {
      responseExamples[key] = {
        summary: item.exampleName || key,
        value: responseExample,
      };
    }
  });

  return responseExamples;
}

// 오버로드: void 형태
export function ApiResponse(
  description: string,
  example?: ApiResponseExampleValue,
): MethodDecorator;
// 오버로드: 복수 예제 형태
export function ApiResponse<TType extends ApiResponseExampleType>(
  examples: ApiResponseExampleItem<TType>[],
  description?: string,
): MethodDecorator;
// 오버로드: 타입 지정 형태
export function ApiResponse(
  dto:
    | ClassConstructor<any>
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor,
  description?: string,
  example?: ApiResponseExampleValue,
): MethodDecorator;
// 오버로드: 인라인 스키마 형태
export function ApiResponse(
  inlineSchema: InlineSchema,
  description?: string,
  example?: ApiResponseExampleValue,
): MethodDecorator;
export function ApiResponse(
  a:
    | string
    | ApiResponseExampleItem[]
    | ClassConstructor<any>
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | InlineSchema,
  b?: string | ApiResponseExampleValue,
  c?: ApiResponseExampleValue,
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    let dto:
      | ClassConstructor<any>
      | StringConstructor
      | NumberConstructor
      | BooleanConstructor
      | null = null;
    let exampleItems: ApiResponseExampleItem[] | null = null;
    let inlineSchema: InlineSchema | null = null;
    let description: string;
    let example: ApiResponseExampleValue | undefined;

    if (typeof a === 'string') {
      // void variant
      description = a;
      example = b as ApiResponseExampleValue | undefined;
    } else if (Array.isArray(a)) {
      exampleItems = a;
      description = (b as string | undefined) ?? '성공';
    } else if (isInlineSchema(a)) {
      // 인라인 스키마 variant
      inlineSchema = a;
      description = (b as string | undefined) ?? '성공';
      example = c as ApiResponseExampleValue | undefined;
    } else {
      dto = a;
      description = (b as string | undefined) ?? '성공';
      example = c as ApiResponseExampleValue | undefined;
    }

    if (exampleItems) {
      const extraModels = exampleItems
        .map((item) => resolveClassType(item.type))
        .filter((item): item is ClassConstructor<any> => item !== null);

      ApiExtraModels(SwaggerResponseDto, ...extraModels)(
        target,
        propertyKey,
        descriptor,
      );

      const responseExamples = buildResponseExamples(exampleItems);

      ApiOkResponse({
        description,
        schema: buildSwaggerSchemaForExampleTypes(exampleItems),
        ...(Object.keys(responseExamples).length > 0
          ? { examples: responseExamples }
          : {}),
      })(target, propertyKey, descriptor);
      return;
    }

    // 인라인 스키마인 경우
    if (inlineSchema) {
      ApiExtraModels(SwaggerResponseDto)(target, propertyKey, descriptor);
      const responseExample = resolveResponseExample(example);
      ApiOkResponse({
        description,
        schema: {
          allOf: [
            { $ref: getSchemaPath(SwaggerResponseDto) },
            {
              properties: {
                data: buildInlineSchema(inlineSchema),
              },
            },
          ],
        },
        ...(responseExample ? { example: responseExample } : {}),
      })(target, propertyKey, descriptor);
      return;
    }

    if (!dto) {
      // data 없이 래퍼만 노출 (void)
      ApiExtraModels(SwaggerResponseDto)(target, propertyKey, descriptor);
      const responseExample = resolveResponseExample(example);
      ApiOkResponse({
        description,
        schema: {
          allOf: [
            { $ref: getSchemaPath(SwaggerResponseDto) },
            {
              properties: {
                data: {
                  nullable: true,
                  example: null,
                },
              },
            },
          ],
        },
        ...(responseExample ? { example: responseExample } : {}),
      })(target, propertyKey, descriptor);
      return;
    }

    const isPrimitive = dto === String || dto === Number || dto === Boolean;
    if (isPrimitive) {
      ApiExtraModels(SwaggerResponseDto)(target, propertyKey, descriptor);
    } else {
      ApiExtraModels(SwaggerResponseDto, dto as ClassConstructor<any>)(
        target,
        propertyKey,
        descriptor,
      );
    }
    const dtoClass = resolveClassType(dto);
    const responseExample =
      resolveResponseExample(example) ||
      (dtoClass ? buildResponseExampleFromClass(dtoClass) : undefined);
    ApiOkResponse({
      description,
      schema: SwaggerSchema(dto),
      ...(responseExample ? { example: responseExample } : {}),
    })(target, propertyKey, descriptor);
  };
}

export function ApiJsxCrud({ useQuery = false }: { useQuery?: boolean }) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    UseInterceptors(CrudRequestInterceptor)(target, propertyKey, descriptor);
    if (useQuery) {
      ApiQuery({
        name: 's',
        description: '검색어',
        required: false,
      })(target, propertyKey, descriptor);
      ApiQuery({
        name: 'sort',
        description: '정렬',
        required: false,
      })(target, propertyKey, descriptor);
      ApiQuery({
        name: 'page',
        description: '페이지',
        required: false,
      })(target, propertyKey, descriptor);
      ApiQuery({
        name: 'limit',
        description: '한 페이지에 보여지는 개수',
        required: false,
      })(target, propertyKey, descriptor);
    }
  };
}
