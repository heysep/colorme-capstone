import { ApiProperty } from '@nestjs/swagger';
import {
  ColumnOptions,
  ColumnType,
  IndexOptions,
  ObjectType,
  PrimaryColumnOptions,
  RelationOptions,
  Column as TypeOrmColumn,
  CreateDateColumn as TypeOrmCreateDateColumn,
  DeleteDateColumn as TypeOrmDeleteDateColumn,
  Index as TypeOrmIndex,
  ManyToOne as TypeOrmManyToOne,
  OneToMany as TypeOrmOneToMany,
  OneToOne as TypeOrmOneToOne,
  PrimaryColumn as TypeOrmPrimaryColumn,
  PrimaryGeneratedColumn as TypeOrmPrimaryGeneratedColumn,
  UpdateDateColumn as TypeOrmUpdateDateColumn,
} from 'typeorm';
import { PrimaryGeneratedColumnNumericOptions } from 'typeorm/decorator/options/PrimaryGeneratedColumnNumericOptions';

// 중첩 깊이 추적을 위한 메타데이터 키
const SWAGGER_DEPTH_KEY = Symbol('swagger:depth');

const resolveMaybeFn = <T>(v: T | (() => T)): T => {
  try {
    return typeof v === 'function' ? (v as any)() : v;
  } catch {
    // 혹시 순환 때문에 아직 접근 불가면 undefined로 묶고 Swagger에선 빠지게.
    return undefined as any;
  }
};

const evaluate = (t: any) => (typeof t === 'function' ? t() : t);

const getSwaggerType = (type: ColumnType) => {
  switch (type) {
    // WithLengthColumnType - 문자열 관련
    case 'character varying':
    case 'varying character':
    case 'char varying':
    case 'nvarchar':
    case 'national varchar':
    case 'character':
    case 'native character':
    case 'varchar':
    case 'char':
    case 'nchar':
    case 'national char':
    case 'varchar2':
    case 'nvarchar2':
    case 'alphanum':
    case 'shorttext':
    case 'string':
    case 'text':
    case 'mediumtext':
    case 'longtext':
    case 'tinytext':
    case 'ntext':
    case 'citext':
    case 'clob':
    case 'nclob':
    case 'json':
    case 'jsonb':
    case 'xml':
    case 'uuid':
    case 'tsvector':
    case 'tsquery':
    case 'varbit':
    case 'bit varying':
    case 'set':
    case 'simple-array':
    case 'simple-json':
    case 'hstore':
    case 'ltree':
    case 'cube':
    case 'array':
      return String;

    // WithWidthColumnType - 정수형 (일반 정수)
    case 'tinyint':
    case 'smallint':
    case 'mediumint':
    case 'int':
    case 'int2':
    case 'int4':
    case 'integer':
    case 'year':
    case 'bit':
      return Number;

    // 큰 정수 타입들 - 문자열로 처리 (JavaScript Number 범위 초과)
    case 'bigint':
    case 'int8':
    case 'int64':
    case 'unsigned big int':
      return String;

    // WithPrecisionColumnType - 소수점/날짜시간
    case 'float':
    case 'double':
    case 'dec':
    case 'decimal':
    case 'smalldecimal':
    case 'fixed':
    case 'numeric':
    case 'real':
    case 'double precision':
    case 'number':
    case 'float4':
    case 'float8':
    case 'float64':
    case 'smallmoney':
    case 'money':
    case 'datetime':
    case 'datetime2':
    case 'datetimeoffset':
    case 'time':
    case 'time with time zone':
    case 'time without time zone':
    case 'timestamp':
    case 'timestamp without time zone':
    case 'timestamp with time zone':
    case 'timestamp with local time zone':
    case 'timetz':
    case 'timestamptz':
    case 'smalldatetime':
    case 'date':
    case 'seconddate':
    case 'interval year to month':
    case 'interval day to second':
    case 'interval':
      return type.includes('time') || type.includes('date') ? Date : Number;

    // Boolean 타입
    case 'boolean':
    case 'bool':
      return Boolean;

    // Spatial 타입들 - 문자열로 처리
    case 'geometry':
    case 'geography':
    case 'st_geometry':
    case 'st_point':
    case 'point':
    case 'line':
    case 'lseg':
    case 'box':
    case 'circle':
    case 'path':
    case 'polygon':
    case 'linestring':
    case 'multipoint':
    case 'multilinestring':
    case 'multipolygon':
    case 'geometrycollection':
      return String;

    // Binary 타입들 - 문자열로 처리
    case 'raw':
    case 'binary':
    case 'varbinary':
    case 'tinyblob':
    case 'mediumblob':
    case 'blob':
    case 'longblob':
    case 'bytes':
    case 'bytea':
    case 'long':
    case 'long raw':
    case 'bfile':
    case 'image':
    case 'rowid':
    case 'urowid':
    case 'uniqueidentifier':
    case 'rowversion':
    case 'hierarchyid':
    case 'sql_variant':
      return String;

    // Network 타입들 - 문자열로 처리
    case 'cidr':
    case 'inet':
    case 'inet4':
    case 'inet6':
    case 'macaddr':
    case 'macaddr8':
      return String;

    // Range 타입들 - 문자열로 처리
    case 'int4range':
    case 'int8range':
    case 'numrange':
    case 'tsrange':
    case 'tstzrange':
    case 'daterange':
    case 'int4multirange':
    case 'int8multirange':
    case 'nummultirange':
    case 'tsmultirange':
    case 'tstzmultirange':
    case 'datemultirange':
      return String;

    default:
      return String;
  }
};

export const Column = (
  options: ColumnOptions & {
    example?: any | (() => any);
    index?: boolean;
    // 고급 인덱스 설정: name/fields/options(고유, fulltext, where 등)
    indexOptions?:
      | ({ name?: string; fields?: string[] } & IndexOptions)
      | undefined;
    // 과거 호환: 최상위에 unique/fulltext를 둔 사용도 허용
    unique?: boolean;
    fulltext?: boolean;
  },
) => {
  return (target: any, propertyKey: string) => {
    const resolvedExample = resolveMaybeFn(options.example);

    ApiProperty({
      description: options.comment,
      example: resolvedExample,
      ...(options.type &&
        options.type !== 'enum' && { type: getSwaggerType(options.type) }),
      ...(options.enum && { enum: options.enum }),
    })(target, propertyKey);

    if (options.index) {
      const idx = options.indexOptions;
      const hasFields = Array.isArray(idx?.fields) && idx!.fields!.length > 0;

      if (hasFields) {
        // 클래스 레벨 복합 인덱스: 현재 컬럼을 포함하도록 보정
        const fields = Array.from(
          new Set([propertyKey, ...(idx!.fields as string[])]),
        );
        const { name, fields: _omit, ...rest } = idx as any;
        // 클래스에 부착
        TypeOrmIndex(name, fields as any, rest)(target.constructor);
      } else {
        // 단일 컬럼 인덱스: 속성에 부착
        const simpleOptions = idx ?? ({} as IndexOptions);
        const compatOptions: IndexOptions = {
          ...(simpleOptions as any),
          ...(typeof options.unique === 'boolean'
            ? { unique: options.unique }
            : {}),
          ...(typeof (options as any).fulltext === 'boolean'
            ? { fulltext: (options as any).fulltext }
            : {}),
        } as IndexOptions;
        TypeOrmIndex(compatOptions)(target, propertyKey);
      }
    }

    TypeOrmColumn(options)(target, propertyKey);
  };
};

export const CreateDateColumn = (
  options: ColumnOptions & {
    example?: any | (() => any);
    index?: boolean;
    unique?: boolean;
    fulltext?: boolean;
  },
) => {
  return (target: any, propertyKey: string) => {
    const resolvedExample = resolveMaybeFn(options.example);

    ApiProperty({
      description: options.comment,
      example: resolvedExample,
      ...(options.type &&
        options.type !== 'enum' && { type: getSwaggerType(options.type) }),
      ...(options.enum && { enum: options.enum }),
    })(target, propertyKey);

    if (options.index) {
      TypeOrmIndex({
        unique: options.unique,
        fulltext: options.fulltext,
      })(target, propertyKey);
    }

    TypeOrmCreateDateColumn(options)(target, propertyKey);
  };
};

export const UpdateDateColumn = (
  options: ColumnOptions & {
    example?: any | (() => any);
    index?: boolean;
    indexOptions?: IndexOptions;
  },
) => {
  return (target: any, propertyKey: string) => {
    const resolvedExample = resolveMaybeFn(options.example);

    ApiProperty({
      description: options.comment,
      example: resolvedExample,
      ...(options.type &&
        options.type !== 'enum' && { type: getSwaggerType(options.type) }),
      ...(options.enum && { enum: options.enum }),
    })(target, propertyKey);

    if (options.index) {
      TypeOrmIndex({
        ...options.indexOptions,
      })(target, propertyKey);
    }

    TypeOrmUpdateDateColumn(options)(target, propertyKey);
  };
};

export const DeleteDateColumn = (
  options: ColumnOptions & {
    example?: any | (() => any);
    index?: boolean;
    indexOptions?: IndexOptions;
  },
) => {
  return (target: any, propertyKey: string) => {
    const resolvedExample = resolveMaybeFn(options.example);

    ApiProperty({
      description: options.comment,
      example: resolvedExample,
      ...(options.type &&
        options.type !== 'enum' && { type: getSwaggerType(options.type) }),
      ...(options.enum && { enum: options.enum }),
    })(target, propertyKey);

    if (options.index) {
      TypeOrmIndex({
        ...options.indexOptions,
      })(target, propertyKey);
    }

    TypeOrmDeleteDateColumn(options)(target, propertyKey);
  };
};

export const PrimaryColumn = (
  options: PrimaryColumnOptions & { example?: any | (() => any) },
) => {
  return (target: any, propertyKey: string) => {
    const resolvedExample = resolveMaybeFn(options.example);

    ApiProperty({
      description: options.comment,
      example: resolvedExample,
    })(target, propertyKey);

    TypeOrmPrimaryColumn(options)(target, propertyKey);
  };
};

export const PrimaryGeneratedColumn = (
  strategy: 'increment',
  options: PrimaryGeneratedColumnNumericOptions & {
    example?: any | (() => any);
  },
) => {
  return (target: any, propertyKey: string) => {
    const resolvedExample = resolveMaybeFn(options.example);

    ApiProperty({
      description: options.comment,
      example: resolvedExample,
    })(target, propertyKey);

    TypeOrmPrimaryGeneratedColumn(strategy, options)(target, propertyKey);
  };
};

export const ManyToOne = <T>(
  typeFnOrTarget: string | ((type?: any) => ObjectType<T>),
  inverseSide: string | ((object: T) => any),
  options: RelationOptions & {
    description?: string;
    example?: any | (() => any);
    type: any | (() => any);
    unique?: boolean;
  },
) => {
  return (target: any, propertyKey: string) => {
    const ex = resolveMaybeFn(options.example);

    // type이 배열을 반환하는 함수인지 확인하고 단일 타입으로 변환
    let swaggerType = options.type;
    if (typeof options.type === 'function') {
      try {
        const evaluated = options.type();
        if (Array.isArray(evaluated) && evaluated.length > 0) {
          // 배열을 반환하는 경우, 첫 번째 요소의 타입을 사용
          swaggerType = () => evaluated[0];
        } else {
          // 단일 타입을 반환하는 경우 그대로 사용
          swaggerType = options.type;
        }
      } catch {
        // 순환 참조 등으로 평가 불가능한 경우, 원본 그대로 사용
        swaggerType = options.type;
      }
    } else if (Array.isArray(options.type)) {
      // 배열인 경우
      swaggerType = () => options.type[0];
    }

    // type을 lazy 함수 형태로 전달하여 순환 참조 문제 해결
    ApiProperty({
      description: options.description,
      example: ex,
      type: swaggerType,
    })(target, propertyKey);

    if (options.unique) {
      TypeOrmIndex({
        unique: options.unique,
      })(target, propertyKey);
    }

    TypeOrmManyToOne(typeFnOrTarget, inverseSide, options)(target, propertyKey);
  };
};

export const OneToOne = <T>(
  typeFnOrTarget: string | ((type?: any) => ObjectType<T>),
  inverseSide: string | ((object: T) => any),
  options: RelationOptions & {
    description?: string;
    example?: any | (() => any);
    type: any | (() => any);
    /**
     * 이 관계에서 주인(owner)인지 여부
     * true: 주인 - 자식 객체가 정상적으로 표시됨
     * false: 하위 객체 - "OneToOne 조건으로 {객체 이름} 이 나옴" 문구만 표시
     * @default true
     */
    isOwner?: boolean;
  },
) => {
  return (target: any, propertyKey: string) => {
    const ex = resolveMaybeFn(options.example);
    const isOwner = options.isOwner !== false; // 기본값은 true

    // 클래스 이름 추출 (isOwner가 false일 때 사용)
    let className = 'Entity';
    if (!isOwner) {
      if (typeof options.type === 'function') {
        try {
          const evaluated = options.type();
          const entityClass = Array.isArray(evaluated)
            ? evaluated[0]
            : evaluated;
          if (entityClass && typeof entityClass === 'function') {
            className = entityClass.name || 'Entity';
          }
        } catch {
          // 순환 참조 등으로 평가 불가능한 경우 기본값 사용
        }
      } else if (Array.isArray(options.type)) {
        const entityClass = options.type[0];
        if (entityClass && typeof entityClass === 'function') {
          className = entityClass.name || 'Entity';
        }
      }
    }

    // type이 배열을 반환하는 함수인지 확인하고 단일 타입으로 변환
    let swaggerType = options.type;
    if (typeof options.type === 'function') {
      try {
        const evaluated = options.type();
        if (Array.isArray(evaluated) && evaluated.length > 0) {
          // 배열을 반환하는 경우, 첫 번째 요소의 타입을 사용
          swaggerType = () => evaluated[0];
        } else {
          // 단일 타입을 반환하는 경우 그대로 사용
          swaggerType = options.type;
        }
      } catch {
        // 순환 참조 등으로 평가 불가능한 경우, 원본 그대로 사용
        swaggerType = options.type;
      }
    } else if (Array.isArray(options.type)) {
      // 배열인 경우
      swaggerType = () => options.type[0];
    }

    // isOwner가 false인 경우 설명 문구만 표시
    if (!isOwner) {
      ApiProperty({
        description: options.description,
        example: `OneToOne 조건으로 ${className} 이 나옴`,
        type: String,
      })(target, propertyKey);
    } else {
      // isOwner가 true인 경우 정상적으로 자식 객체 표시
      ApiProperty({
        description: options.description,
        example: ex,
        type: swaggerType,
      })(target, propertyKey);
    }

    TypeOrmOneToOne(typeFnOrTarget, inverseSide, options)(target, propertyKey);
  };
};

export const OneToMany = <T>(
  typeFnOrTarget: string | ((type?: any) => ObjectType<T>),
  inverseSide: string | ((object: T) => any),
  options: RelationOptions & {
    description?: string;
    example?: any | (() => any);
    type: any | (() => any); // () => Class (단일 타입만 전달)
    exampleType?: 'entity' | 'placeholder';
  },
) => {
  return (target: any, propertyKey: string) => {
    const resolvedExample = resolveMaybeFn(options.example);
    const exampleType = options.exampleType ?? 'placeholder';

    // type이 배열을 반환하는 함수인지 확인하고 단일 타입으로 변환
    let swaggerType = options.type;
    if (typeof options.type === 'function') {
      try {
        const evaluated = options.type();
        if (Array.isArray(evaluated) && evaluated.length > 0) {
          // 배열을 반환하는 경우, 첫 번째 요소의 타입을 사용
          swaggerType = () => evaluated[0];
        } else {
          // 단일 타입을 반환하는 경우 그대로 사용
          swaggerType = options.type;
        }
      } catch {
        // 순환 참조 등으로 평가 불가능한 경우, 원본 그대로 사용
        swaggerType = options.type;
      }
    } else if (Array.isArray(options.type)) {
      // 배열인 경우
      swaggerType = () => options.type[0];
    }

    if (exampleType === 'entity') {
      const apiPropertyOptions: Record<string, any> = {
        description: options.description,
        type: swaggerType,
        isArray: true,
      };
      if (resolvedExample !== undefined) {
        apiPropertyOptions.example = Array.isArray(resolvedExample)
          ? resolvedExample
          : [resolvedExample];
      }
      ApiProperty(apiPropertyOptions)(target, propertyKey);
    } else {
      // 클래스 이름 추출
      let className = 'Entity';
      if (typeof options.type === 'function') {
        try {
          const evaluated = options.type();
          const entityClass = Array.isArray(evaluated)
            ? evaluated[0]
            : evaluated;
          if (entityClass && typeof entityClass === 'function') {
            className = entityClass.name || 'Entity';
          }
        } catch {
          // 순환 참조 등으로 평가 불가능한 경우 기본값 사용
        }
      } else if (Array.isArray(options.type)) {
        const entityClass = options.type[0];
        if (entityClass && typeof entityClass === 'function') {
          className = entityClass.name || 'Entity';
        }
      }

      // OneToMany는 Swagger 스키마에서 빈 배열로 표시
      // 배열 안에 설명 문구를 string으로 추가
      ApiProperty({
        description: options.description,
        example: [`OneToMany조건 으로 ${className} 이 나옴`],
        type: [String],
        isArray: true,
      })(target, propertyKey);
    }

    TypeOrmOneToMany(typeFnOrTarget, inverseSide, options)(target, propertyKey);
  };
};
