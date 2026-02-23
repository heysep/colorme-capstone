/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CreateManyDto,
  CrudRequest,
  CrudRequestOptions,
  CustomOperators,
  GetManyDefaultResponse,
  JoinOption,
  JoinOptions,
  QueryOptions,
} from '@dataui/crud';
import {
  ComparisonOperator,
  ParsedRequestParams,
  QueryFilter,
  QueryJoin,
  QuerySort,
  SCondition,
  SConditionKey,
} from '@dataui/crud-request';
import {
  ClassType,
  hasLength,
  isArrayFull,
  isNil,
  isNull,
  isObject,
  isUndefined,
  objKeys,
} from '@dataui/crud-util';
import { oO } from '@zmotivat0r/o0';
import { plainToClass } from 'class-transformer';
import {
  Brackets,
  ColumnType,
  ConnectionOptions,
  DeepPartial,
  EntityMetadata,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';
import { CommonError } from '../../../core-response/utils/common-error.util';
import { GlbCoreTypeOrmError } from '../../error/tenant/tenant-error.error';

interface IAllowedRelation {
  alias?: string;
  nested: boolean;
  name: string;
  path: string;
  columns: string[];
  primaryColumns: string[];
  allowedColumns: string[];
}

// GroupBy 관련 타입 정의
export interface GroupByParams {
  groupBy: string[]; // 그룹화할 필드들
  aggregations?: AggregationConfig[]; // 집계 함수들
  having?: any; // HAVING 조건
  /**
   * JOIN된 테이블 필드를 사용할 때 서브쿼리 패턴 사용 여부
   *
   * groupBy, where, order, aggregations 중 어느 곳에서든 JOIN된 테이블 필드를 사용하면
   * 페이징이 부정확해질 수 있으므로 서브쿼리 패턴을 사용하여 해결합니다.
   *
   * true: 자동으로 서브쿼리 패턴 사용 (페이징 정확도 보장)
   * false: 단일 쿼리 사용 (성능 우선, 페이징이 부정확할 수 있음)
   * undefined: 자동 감지 (groupBy/where/order/aggregations 중 JOIN된 테이블 필드가 있으면 true)
   */
  useSubqueryForJoinAggregations?: boolean;
}

interface AggregationConfig {
  field: string; // 집계할 필드
  function: 'COUNT' | 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT_DISTINCT';
  alias?: string; // 결과 필드명
  distinct?: boolean; // DISTINCT 적용 여부 (COUNT에서만 사용)
}

export interface GroupByResponse<T> {
  data: GroupByResult<T>[];
  count: number; // 전체 그룹 수
  total: number; // 전체 레코드 수 (집계 전)
  page: number;
  pageCount: number;
}

export interface GroupByResult<T> {
  groupKey: Record<string, any>; // 그룹 키-값 쌍
  aggregations: T; // 집계 결과
  count: number; // 해당 그룹의 레코드 수
}

export abstract class CrudService<T, DTO = T> {
  abstract getMany(
    req: CrudRequest,
  ): Promise<GetManyDefaultResponse<T> | T[] | GroupByResponse<T>>;

  abstract getManyWithGroupBy<E>(req: CrudRequest): Promise<GroupByResponse<E>>;

  abstract getOne(req: CrudRequest): Promise<T>;

  abstract createOne(req: CrudRequest, dto: DTO): Promise<T>;

  abstract createMany(req: CrudRequest, dto: CreateManyDto): Promise<T[]>;

  abstract updateOne(req: CrudRequest, dto: DTO): Promise<T>;

  abstract replaceOne(req: CrudRequest, dto: DTO): Promise<T>;

  abstract deleteOne(req: CrudRequest): Promise<void | T>;

  abstract recoverOne(req: CrudRequest): Promise<void | T>;

  throwBadRequestException(msg?: any) {
    return CommonError.createByErrorCode(
      GlbCoreTypeOrmError.JSX_CRUD_BAD_REQUEST,
      `
      ${GlbCoreTypeOrmError.JSX_CRUD_BAD_REQUEST.message} --> ${msg}`,
    );
  }

  throwNotFoundException(name: string) {
    return CommonError.createByErrorCode(
      GlbCoreTypeOrmError.JSX_CRUD_NOT_FOUND,
      `
      ${GlbCoreTypeOrmError.JSX_CRUD_NOT_FOUND.message} --> ${name} not found`,
    );
  }

  /**
   * Wrap page into page-info
   * override this method to create custom page-info response
   * or set custom `serialize.getMany` dto in the controller's CrudOption
   * @param data
   * @param total
   * @param limit
   * @param offset
   */
  createPageInfo(
    data: T[],
    total: number,
    limit: number,
    offset: number,
  ): GetManyDefaultResponse<T> {
    return {
      data,
      count: data.length,
      total,
      page: limit ? Math.floor(offset / limit) + 1 : 1,
      pageCount: limit && total ? Math.ceil(total / limit) : 1,
    };
  }

  createPageInfoForGetManyCustom(
    data: T[],
    total: number,
    page: number,
    pageCount: number,
  ): GetManyDefaultResponse<T> {
    return {
      data,
      count: data.length,
      total,
      page,
      pageCount,
    };
  }

  /**
   * Determine if need paging
   * @param parsed
   * @param options
   */
  decidePagination(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
  ): boolean {
    return (
      options.query.alwaysPaginate ||
      ((Number.isFinite(parsed.page) || Number.isFinite(parsed.offset)) &&
        /* istanbul ignore next */ !!this.getTake(parsed, options.query))
    );
  }

  /**
   * Get number of resources to be fetched
   * @param query
   * @param options
   */
  getTake(query: ParsedRequestParams, options: QueryOptions): number | null {
    if (query.limit) {
      return options.maxLimit
        ? query.limit <= options.maxLimit
          ? query.limit
          : options.maxLimit
        : query.limit;
    }
    /* istanbul ignore if */
    if (options.limit) {
      return options.maxLimit
        ? options.limit <= options.maxLimit
          ? options.limit
          : options.maxLimit
        : options.limit;
    }

    return options.maxLimit ? options.maxLimit : null;
  }

  /**
   * Get number of resources to be skipped
   * @param query
   * @param take
   */
  getSkip(query: ParsedRequestParams, take: number): number | null {
    return query.page && take
      ? take * (query.page - 1)
      : query.offset
        ? query.offset
        : null;
  }

  /**
   * Get primary param name from CrudOptions
   * @param options
   */
  getPrimaryParams(options: CrudRequestOptions): string[] {
    const params = objKeys(options.params).filter(
      (n) => options.params[n] && options.params[n].primary,
    );

    return params.map((p) => options.params[p].field);
  }
}

export class TypeOrmCrudService<T extends ObjectLiteral> extends CrudService<
  T,
  DeepPartial<T>
> {
  protected dbName: ConnectionOptions['type'];
  protected entityColumns: string[];
  protected entityPrimaryColumns: string[];
  protected entityHasDeleteColumn: boolean = false;
  protected entityColumnsHash: ObjectLiteral = {};
  protected entityRelationsHash: Map<string, IAllowedRelation> = new Map();
  protected sqlInjectionRegEx: RegExp[] = [
    /(%27)|(\')|(--)|(%23)|(#)/gi,
    /((%3D)|(=))[^\n]*((%27)|(\')|(--)|(%3B)|(;))/gi,
    /w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))/gi,
    /((%27)|(\'))union/gi,
  ];

  constructor(protected repo: Repository<T>) {
    super();

    this.dbName = this.repo.metadata.connection.options.type;
    this.onInitMapEntityColumns();
  }

  public get findOne(): Repository<T>['findOne'] {
    return this.repo.findOne.bind(this.repo);
  }

  public get findOneBy(): Repository<T>['findOneBy'] {
    return this.repo.findOneBy.bind(this.repo);
  }

  public get find(): Repository<T>['find'] {
    return this.repo.find.bind(this.repo);
  }

  public get count(): Repository<T>['count'] {
    return this.repo.count.bind(this.repo);
  }

  protected get entityType(): ClassType<T> {
    return this.repo.target as ClassType<T>;
  }

  protected get alias(): string {
    return this.repo.metadata.targetName;
  }

  // ---------------------------------
  // GroupBy 관련 유틸 함수들
  // ---------------------------------

  /**
   * URL 쿼리에서 GroupBy 파라미터를 파싱
   * 예: ?groupBy=category,status&agg=count:id,sum:amount:total_amount
   */
  private parseGroupByParams(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: CrudRequest & { parsed: ParsedRequestParams | any },
  ): GroupByParams | null {
    const { parsed } = req;

    // URL 쿼리에서 groupBy 파라미터 확인
    const groupByQuery = (parsed as any).groupBy;
    if (!groupByQuery) {
      return null;
    }

    const groupBy = Array.isArray(groupByQuery)
      ? groupByQuery
      : groupByQuery.split(',').map((field: string) => field.trim());

    const aggregations: AggregationConfig[] = [];
    const aggQuery = (parsed as any).agg;

    if (aggQuery) {
      const aggParts = Array.isArray(aggQuery) ? aggQuery : aggQuery.split(',');

      for (const aggPart of aggParts) {
        const parts = aggPart.trim().split(':');
        if (parts.length >= 2) {
          const func = parts[0].toUpperCase() as AggregationConfig['function'];
          const field = parts[1];
          const alias = parts[2] || `${func.toLowerCase()}_${field}`;

          aggregations.push({
            function: func,
            field,
            alias,
            distinct: func === 'COUNT' && parts.includes('distinct'),
          });
        }
      }
    }

    // HAVING 조건 파싱 (기존 search 조건과 유사한 형태)
    const having = (parsed as any).having || null;

    // 서브쿼리 옵션 파싱
    const useSubqueryForJoinAggregations = (parsed as any)
      .useSubqueryForJoinAggregations;

    return {
      groupBy,
      aggregations: aggregations.length > 0 ? aggregations : undefined,
      having,
      useSubqueryForJoinAggregations,
    };
  }

  /**
   * JOIN된 테이블 필드를 사용하는지 확인
   * groupBy, where, order, aggregations 모두 확인
   */
  private hasJoinFieldInQuery(
    groupByParams: GroupByParams,
    parsed: ParsedRequestParams,
    joinOptions?: any,
  ): boolean {
    if (!joinOptions) {
      return false;
    }

    // JOIN alias 매핑 생성 (alias -> joinField)
    const aliasToJoinField = new Map<string, string>();
    Object.entries(joinOptions).forEach(
      ([joinField, joinOption]: [string, any]) => {
        if (joinOption.alias) {
          aliasToJoinField.set(joinOption.alias, joinField);
        }
        // alias가 없어도 joinField 자체를 확인
        aliasToJoinField.set(joinField, joinField);
      },
    );

    const isJoinField = (field: string): boolean => {
      if (!field.includes('.')) {
        return false;
      }
      const fieldPrefix = field.split('.')[0];
      return (
        aliasToJoinField.has(fieldPrefix) ||
        Object.keys(joinOptions).includes(fieldPrefix)
      );
    };

    // 1. groupBy 필드에 JOIN된 테이블 필드가 있는지 확인
    if (groupByParams.groupBy.some((field) => isJoinField(field))) {
      return true;
    }

    // 2. where (search) 조건에 JOIN된 테이블 필드가 있는지 확인
    if (parsed.search) {
      const joinFieldsInSearch = this.extractJoinFieldsFromSearch(
        parsed.search,
      );
      if (joinFieldsInSearch.size > 0) {
        return true;
      }
    }

    // 3. order (sort)에 JOIN된 테이블 필드가 있는지 확인
    if (parsed.sort && parsed.sort.length > 0) {
      if (parsed.sort.some((sortItem) => isJoinField(sortItem.field))) {
        return true;
      }
    }

    // 4. aggregations에 JOIN된 테이블 필드가 있는지 확인
    if (groupByParams.aggregations) {
      if (groupByParams.aggregations.some((agg) => isJoinField(agg.field))) {
        return true;
      }
    }

    return false;
  }

  /**
   * JOIN된 테이블 필드를 집계에 사용하는지 확인 (기존 메서드, 호환성 유지)
   */
  private hasJoinFieldInAggregations(
    groupByParams: GroupByParams,
    joinOptions?: any,
  ): boolean {
    if (!groupByParams.aggregations || !joinOptions) {
      return false;
    }

    // JOIN alias 매핑 생성 (alias -> joinField)
    const aliasToJoinField = new Map<string, string>();
    Object.entries(joinOptions).forEach(
      ([joinField, joinOption]: [string, any]) => {
        if (joinOption.alias) {
          aliasToJoinField.set(joinOption.alias, joinField);
        }
        // alias가 없어도 joinField 자체를 확인
        aliasToJoinField.set(joinField, joinField);
      },
    );

    // 집계 함수에서 JOIN된 테이블 필드 사용 여부 확인
    return groupByParams.aggregations.some((agg) => {
      if (agg.field.includes('.')) {
        const fieldPrefix = agg.field.split('.')[0];
        // JOIN alias나 joinField에 포함되어 있으면 JOIN된 테이블 필드
        return (
          aliasToJoinField.has(fieldPrefix) ||
          Object.keys(joinOptions).includes(fieldPrefix)
        );
      }
      return false;
    });
  }

  /**
   * GroupBy 파라미터 유효성 검사
   */
  private validateGroupByParams(params: GroupByParams): void {
    // groupBy 필드 유효성 검사
    for (const field of params.groupBy) {
      if (!this.entityColumns.includes(field) && !field.includes('.')) {
        throw CommonError.createByErrorCode(
          GlbCoreTypeOrmError.JSX_CRUD_BAD_REQUEST,
          `Invalid groupBy field: ${field}`,
        );
      }
    }

    // 집계 함수 유효성 검사
    if (params.aggregations) {
      const validFunctions = [
        'COUNT',
        'SUM',
        'AVG',
        'MAX',
        'MIN',
        'COUNT_DISTINCT',
      ];
      for (const agg of params.aggregations) {
        if (!validFunctions.includes(agg.function)) {
          throw CommonError.createByErrorCode(
            GlbCoreTypeOrmError.JSX_CRUD_BAD_REQUEST,
            `Invalid aggregation function: ${agg.function}`,
          );
        }

        if (
          !this.entityColumns.includes(agg.field) &&
          !agg.field.includes('.')
        ) {
          throw CommonError.createByErrorCode(
            GlbCoreTypeOrmError.JSX_CRUD_BAD_REQUEST,
            `Invalid aggregation field: ${agg.field}`,
          );
        }
      }
    }
  }

  /**
   * GroupBy 전용 쿼리 빌더 생성
   */
  private async createGroupByBuilder(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
    groupByParams: GroupByParams,
  ): Promise<SelectQueryBuilder<T>> {
    const builder = this.repo.createQueryBuilder(this.alias);
    const joinOptions = options.query?.join || {};

    // 1. SELECT 절 구성 (그룹 필드 + 집계 함수) - joinOptions 전달
    this.setGroupBySelect(builder, groupByParams, joinOptions);

    // 2. soft-delete 조건
    if (this.entityHasDeleteColumn && options.query.softDelete) {
      if (parsed.includeDeleted === 1) {
        builder.withDeleted();
      }
    }

    // 3. WHERE 조건 (기존 search 로직 재사용)
    this.setSearchCondition(
      builder,
      parsed.search,
      options.operators?.custom || {},
    );

    // 4. 필요한 JOIN만 추가
    this.setGroupByJoins(
      builder,
      options,
      groupByParams,
      parsed.join || [],
      parsed,
    );

    // 5. GROUP BY 절
    this.setGroupBy(builder, groupByParams, joinOptions);

    // 6. HAVING 절
    if (groupByParams.having) {
      this.setHavingCondition(
        builder,
        groupByParams.having,
        options.operators?.custom || {},
      );
    }

    return builder;
  }

  /**
   * GroupBy SELECT 절 구성
   * JOIN alias를 올바르게 처리하도록 개선
   */
  private setGroupBySelect(
    builder: SelectQueryBuilder<T>,
    params: GroupByParams,
    joinOptions?: any,
  ): void {
    const selectFields: string[] = [];

    // JOIN alias 매핑 생성 (alias -> joinField)
    const aliasToJoinField = new Map<string, string>();
    if (joinOptions) {
      Object.entries(joinOptions).forEach(
        ([joinField, joinOption]: [string, any]) => {
          if (joinOption.alias) {
            aliasToJoinField.set(joinOption.alias, joinField);
          }
        },
      );
    }

    // 그룹 필드들 추가
    params.groupBy.forEach((field) => {
      let fieldWithAlias: string;
      if (field.includes('.')) {
        const [prefix, ...rest] = field.split('.');
        const actualJoinField = aliasToJoinField.get(prefix) || prefix;
        // JOIN alias를 실제 alias로 사용
        const actualAlias = joinOptions?.[actualJoinField]?.alias || prefix;
        fieldWithAlias = `${actualAlias}.${rest.join('.')}`;
      } else {
        fieldWithAlias = `${this.alias}.${field}`;
      }
      selectFields.push(`${fieldWithAlias} as ${field.replace('.', '_')}`);
    });

    // 기본 COUNT 추가 (각 그룹의 레코드 수)
    selectFields.push(`COUNT(*) as group_count`);

    // 집계 함수들 추가
    if (params.aggregations) {
      params.aggregations.forEach((agg) => {
        const alias = agg.alias || `${agg.function.toLowerCase()}_${agg.field}`;
        let fieldWithAlias: string;
        if (agg.field.includes('.')) {
          const [prefix, ...rest] = agg.field.split('.');
          const actualJoinField = aliasToJoinField.get(prefix) || prefix;
          // JOIN alias를 실제 alias로 사용
          const actualAlias = joinOptions?.[actualJoinField]?.alias || prefix;
          fieldWithAlias = `${actualAlias}.${rest.join('.')}`;
        } else {
          fieldWithAlias = `${this.alias}.${agg.field}`;
        }

        let aggFunction: string;
        switch (agg.function) {
          case 'COUNT_DISTINCT':
            aggFunction = `COUNT(DISTINCT ${fieldWithAlias})`;
            break;
          case 'COUNT':
            aggFunction = agg.distinct
              ? `COUNT(DISTINCT ${fieldWithAlias})`
              : `COUNT(${fieldWithAlias})`;
            break;
          default:
            aggFunction = `${agg.function}(${fieldWithAlias})`;
        }

        selectFields.push(`${aggFunction} as ${alias}`);
      });
    }

    builder.select(selectFields);
  }

  /**
   * GroupBy에 필요한 JOIN만 설정
   * alias 매핑을 올바르게 처리하도록 개선
   */
  private setGroupByJoins(
    builder: SelectQueryBuilder<T>,
    options: CrudRequestOptions,
    groupByParams: GroupByParams,
    parsedJoins: QueryJoin[],
    parsed: ParsedRequestParams,
  ): void {
    const joinOptions = options.query?.join || {};
    const requiredJoins = new Set<string>();

    // JOIN alias 매핑 생성 (alias -> joinField)
    const aliasToJoinField = new Map<string, string>();
    Object.entries(joinOptions).forEach(([joinField, joinOption]) => {
      if (joinOption.alias) {
        aliasToJoinField.set(joinOption.alias, joinField);
      }
    });

    // GroupBy 필드에서 필요한 JOIN 추출 (alias 고려)
    groupByParams.groupBy.forEach((field) => {
      if (field.includes('.')) {
        const fieldPrefix = field.split('.')[0];
        // alias가 있으면 실제 joinField로 변환
        const actualJoinField =
          aliasToJoinField.get(fieldPrefix) || fieldPrefix;
        requiredJoins.add(actualJoinField);
      }
    });

    // 집계 필드에서 필요한 JOIN 추출 (alias 고려)
    if (groupByParams.aggregations) {
      groupByParams.aggregations.forEach((agg) => {
        if (agg.field.includes('.')) {
          const fieldPrefix = agg.field.split('.')[0];
          // alias가 있으면 실제 joinField로 변환
          const actualJoinField =
            aliasToJoinField.get(fieldPrefix) || fieldPrefix;
          requiredJoins.add(actualJoinField);
        }
      });
    }

    // 검색 조건에서 필요한 JOIN 추출 (alias 고려)
    const joinInSearch = this.extractJoinFieldsFromSearch(parsed.search);
    joinInSearch.forEach((field) => {
      const actualJoinField = aliasToJoinField.get(field) || field;
      requiredJoins.add(actualJoinField);
    });

    // HAVING 조건에서 필요한 JOIN 추출 (alias 고려)
    if (groupByParams.having) {
      const joinInHaving = this.extractJoinFieldsFromSearch(
        groupByParams.having,
      );
      joinInHaving.forEach((field) => {
        const actualJoinField = aliasToJoinField.get(field) || field;
        requiredJoins.add(actualJoinField);
      });
    }

    // 필요한 JOIN만 적용
    const allowedJoins = Object.keys(joinOptions);
    allowedJoins.forEach((joinField) => {
      if (joinOptions[joinField].eager && requiredJoins.has(joinField)) {
        const cond = parsedJoins.find((j) => j?.field === joinField) || {
          field: joinField,
        };
        this.setJoin(cond, joinOptions, builder);
      }
    });
  }

  /**
   * GROUP BY 절 설정
   * JOIN alias를 올바르게 처리하도록 개선
   */
  private setGroupBy(
    builder: SelectQueryBuilder<T>,
    params: GroupByParams,
    joinOptions?: any,
  ): void {
    // JOIN alias 매핑 생성 (alias -> joinField)
    const aliasToJoinField = new Map<string, string>();
    if (joinOptions) {
      Object.entries(joinOptions).forEach(
        ([joinField, joinOption]: [string, any]) => {
          if (joinOption.alias) {
            aliasToJoinField.set(joinOption.alias, joinField);
          }
        },
      );
    }

    params.groupBy.forEach((field) => {
      let fieldWithAlias: string;
      if (field.includes('.')) {
        const [prefix, ...rest] = field.split('.');
        const actualJoinField = aliasToJoinField.get(prefix) || prefix;
        // JOIN alias를 실제 alias로 사용
        const actualAlias = joinOptions?.[actualJoinField]?.alias || prefix;
        fieldWithAlias = `${actualAlias}.${rest.join('.')}`;
      } else {
        fieldWithAlias = `${this.alias}.${field}`;
      }
      builder.addGroupBy(fieldWithAlias);
    });
  }

  /**
   * HAVING 조건 설정
   */
  private setHavingCondition(
    builder: SelectQueryBuilder<T>,
    having: any,
    customOperators: CustomOperators,
  ): void {
    // HAVING 조건은 집계 함수 결과에 대한 조건이므로 별도 처리 필요
    // 일단 기본적인 구현으로 시작
    if (isObject(having)) {
      const keys = objKeys(having);
      keys.forEach((key) => {
        const value = having[key];
        if (!isObject(value)) {
          builder.andHaving(`${key} = :having_${key}`, {
            [`having_${key}`]: value,
          });
        } else {
          // 복잡한 HAVING 조건은 추후 확장 가능
          const operator = objKeys(value)[0];
          const operatorValue = value[operator];

          switch (operator) {
            case '$gt':
              builder.andHaving(`${key} > :having_${key}`, {
                [`having_${key}`]: operatorValue,
              });
              break;
            case '$gte':
              builder.andHaving(`${key} >= :having_${key}`, {
                [`having_${key}`]: operatorValue,
              });
              break;
            case '$lt':
              builder.andHaving(`${key} < :having_${key}`, {
                [`having_${key}`]: operatorValue,
              });
              break;
            case '$lte':
              builder.andHaving(`${key} <= :having_${key}`, {
                [`having_${key}`]: operatorValue,
              });
              break;
            case '$ne':
              builder.andHaving(`${key} != :having_${key}`, {
                [`having_${key}`]: operatorValue,
              });
              break;
            default:
              builder.andHaving(`${key} = :having_${key}`, {
                [`having_${key}`]: operatorValue,
              });
          }
        }
      });
    }
  }

  /**
   * 전체 그룹 수 조회 (페이징을 위해)
   * 서브쿼리 alias 문제를 해결하기 위해 직접 그룹 결과를 가져와서 개수를 계산
   */
  private async getGroupByCount(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
    groupByParams: GroupByParams,
  ): Promise<number> {
    const builder = this.repo.createQueryBuilder(this.alias);

    // 그룹 필드들만 SELECT
    const groupFields = groupByParams.groupBy.map((field) => {
      return field.includes('.') ? field : `${this.alias}.${field}`;
    });
    builder.select(groupFields);

    // soft-delete 조건
    if (this.entityHasDeleteColumn && options.query.softDelete) {
      if (parsed.includeDeleted === 1) {
        builder.withDeleted();
      }
    }

    // WHERE 조건
    this.setSearchCondition(
      builder,
      parsed.search,
      options.operators?.custom || {},
    );

    // 필요한 JOIN
    this.setGroupByJoins(
      builder,
      options,
      groupByParams,
      parsed.join || [],
      parsed,
    );

    // GROUP BY
    const joinOptions = options.query?.join || {};
    this.setGroupBy(builder, groupByParams, joinOptions);

    // HAVING
    if (groupByParams.having) {
      this.setHavingCondition(
        builder,
        groupByParams.having,
        options.operators?.custom || {},
      );
    }

    // 직접 그룹 결과를 가져와서 개수를 계산 (서브쿼리 alias 문제 해결)
    try {
      const groupedResults = await builder.getRawMany();
      return groupedResults.length;
    } catch (error) {
      console.error('GroupBy count query error:', error);

      // 대안: 더 안전한 서브쿼리 방식
      // 새로운 빌더를 생성하여 alias 충돌 방지
      const countBuilder = this.repo.createQueryBuilder('countAlias');

      // 동일한 조건으로 COUNT DISTINCT 사용
      const distinctFields = groupByParams.groupBy.map((field) => {
        return field.includes('.') ? field : `countAlias.${field}`;
      });

      countBuilder.select(
        `COUNT(DISTINCT CONCAT(${distinctFields.join(", '-', ")}))`,
        'count',
      );

      // soft-delete 조건
      if (this.entityHasDeleteColumn && options.query?.softDelete) {
        if (parsed.includeDeleted === 1) {
          countBuilder.withDeleted();
        }
      }

      // WHERE 조건 재적용
      this.setSearchCondition(
        countBuilder,
        parsed.search,
        options.operators?.custom || {},
      );

      // JOIN 재적용
      this.setGroupByJoins(
        countBuilder,
        options,
        groupByParams,
        parsed.join || [],
        parsed,
      );

      const result = await countBuilder.getRawOne();
      return parseInt(result?.count) || 0;
    }
  }

  /**
   * GroupBy 결과 변환
   */
  private transformGroupByResults<E>(
    rawResults: any[],
    params: GroupByParams,
  ): GroupByResult<E>[] {
    return rawResults.map((raw) => {
      const groupKey: Record<string, any> = {};
      const aggregations: Record<string, any> = {};

      // 그룹 키 추출
      params.groupBy.forEach((field) => {
        const key = field.replace('.', '_');
        groupKey[field] = raw[key];
      });

      // 집계 결과 추출
      if (params.aggregations) {
        params.aggregations.forEach((agg) => {
          const alias =
            agg.alias || `${agg.function.toLowerCase()}_${agg.field}`;
          aggregations[alias] = raw[alias];
        });
      }

      return {
        groupKey,
        aggregations,
        count: parseInt(raw.group_count) || 0,
      };
    }) as GroupByResult<E>[];
  }

  /**
   * GroupBy 응답 생성
   */
  private createGroupByResponse<E>(
    data: GroupByResult<E>[],
    totalGroups: number,
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
  ): GroupByResponse<E> {
    const limit = this.getTake(parsed, options.query || {});
    const page = parsed.page || 1;
    const pageCount = limit && totalGroups ? Math.ceil(totalGroups / limit) : 1;

    // 전체 레코드 수는 각 그룹의 count를 합한 값
    const total = data.reduce((sum, group) => sum + group.count, 0);

    return {
      data,
      count: data.length,
      total: totalGroups, // 그룹 수를 total로 사용
      page,
      pageCount,
    };
  }

  /**
   * GroupBy용 페이징 정보 가져오기
   */
  private getGroupByPaging(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
  ): { take: number | null; skip: number | null } {
    const take = this.getTake(parsed, options.query || {});
    const skip = this.getSkip(parsed, take || 0);
    return { take, skip };
  }

  /**
   * 서브쿼리 패턴을 사용한 GroupBy 쿼리 실행
   * JOIN된 테이블 필드를 집계에 사용할 때 페이징 정확도를 보장하기 위해 사용
   *
   * 전략:
   * 1. 먼저 그룹 키만으로 GROUP BY + 정렬 + LIMIT 수행 (서브쿼리)
   * 2. 그 그룹 키로 다시 전체 쿼리 수행 (JOIN 포함, 집계 포함)
   */
  private async getManyWithGroupByUsingSubquery<E>(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
    groupByParams: GroupByParams,
  ): Promise<any[]> {
    const joinOptions = options.query?.join || {};
    const { take, skip } = this.getGroupByPaging(parsed, options);
    const maxValueGetManyLimit = parseInt(
      process.env?.['JSXCRUD_MAX_VALUE_GET_MANY_LIMIT'] ?? '1000',
    );
    const finalTake =
      take !== null && isFinite(take) ? take : maxValueGetManyLimit || 1000;

    // JOIN alias 매핑 생성 (한 번만 생성)
    const aliasToJoinField = new Map<string, string>();
    Object.entries(joinOptions).forEach(
      ([joinField, joinOption]: [string, any]) => {
        if (joinOption.alias) {
          aliasToJoinField.set(joinOption.alias, joinField);
        }
        aliasToJoinField.set(joinField, joinField);
      },
    );

    // 컬럼 alias를 추적하기 위한 Map 생성 (함수 전체에서 사용)
    const fieldToColumnAlias = new Map<string, string>();

    // 1단계: 그룹 키만으로 GROUP BY + 정렬 + LIMIT 수행
    // 메인 엔티티의 alias를 사용해야 JOIN이 정상 작동함
    const subqueryBuilder = this.repo.createQueryBuilder(this.alias);

    // 그룹 키 필드만 SELECT
    const groupBySelectFields: string[] = [];

    groupByParams.groupBy.forEach((field) => {
      let fieldWithAlias: string;
      if (field.includes('.')) {
        const [prefix, ...rest] = field.split('.');
        const actualJoinField = aliasToJoinField.get(prefix) || prefix;
        const actualAlias = joinOptions?.[actualJoinField]?.alias || prefix;
        fieldWithAlias = `${actualAlias}.${rest.join('.')}`;
      } else {
        fieldWithAlias = `${this.alias}.${field}`;
      }
      const columnAlias = field.replace('.', '_');
      fieldToColumnAlias.set(field, columnAlias);
      groupBySelectFields.push(`${fieldWithAlias} as ${columnAlias}`);
    });

    subqueryBuilder.select(groupBySelectFields);

    // soft-delete 조건
    if (this.entityHasDeleteColumn && options.query.softDelete) {
      if (parsed.includeDeleted === 1) {
        subqueryBuilder.withDeleted();
      }
    }

    // WHERE 조건
    this.setSearchCondition(
      subqueryBuilder,
      parsed.search,
      options.operators?.custom || {},
    );

    // 필요한 JOIN (그룹 키에 필요한 것만)
    this.setGroupByJoins(
      subqueryBuilder,
      options,
      groupByParams,
      parsed.join || [],
      parsed,
    );

    // setGroupByJoins가 JOIN된 테이블의 모든 컬럼을 SELECT에 추가하므로
    // 서브쿼리에서는 그룹 키만 필요하므로 SELECT를 다시 설정
    // 성능 최적화: 불필요한 데이터 전송 방지
    subqueryBuilder.select(groupBySelectFields);

    // GROUP BY

    groupByParams.groupBy.forEach((field) => {
      let fieldWithAlias: string;
      if (field.includes('.')) {
        const [prefix, ...rest] = field.split('.');
        const actualJoinField = aliasToJoinField.get(prefix) || prefix;
        const actualAlias = joinOptions?.[actualJoinField]?.alias || prefix;
        fieldWithAlias = `${actualAlias}.${rest.join('.')}`;
      } else {
        fieldWithAlias = `${this.alias}.${field}`;
      }
      subqueryBuilder.addGroupBy(fieldWithAlias);
    });

    // 정렬 적용
    this.setGroupBySort(subqueryBuilder, parsed, groupByParams);

    // LIMIT 적용
    subqueryBuilder.take(finalTake);
    if (skip !== null && isFinite(skip)) {
      subqueryBuilder.skip(skip);
    }

    // 생성된 쿼리 확인 (파라미터 플레이스홀더가 있는 쿼리)
    const generatedQuery = subqueryBuilder.getQuery();
    const hasLimit = generatedQuery.toLowerCase().includes('limit');

    // // 디버깅: 서브쿼리 쿼리 확인
    // console.log('=== 서브쿼리 쿼리 ===');
    // console.log(generatedQuery);
    // console.log('hasLimit:', hasLimit);
    // console.log('finalTake:', finalTake);
    // console.log('skip:', skip);

    let groupKeys: any[];

    if (!hasLimit) {
      // LIMIT가 생성되지 않았다면 SQL에 직접 추가
      // getQueryAndParameters()를 사용하여 파라미터와 함께 가져오기
      const [query, queryParams] = subqueryBuilder.getQueryAndParameters();
      let finalQuery = query;

      // LIMIT/OFFSET 추가 (파라미터 바인딩 없이 직접 값 사용)
      if (skip !== null && isFinite(skip) && skip > 0) {
        finalQuery += ` LIMIT ${finalTake} OFFSET ${skip}`;
      } else if (finalTake !== null && isFinite(finalTake)) {
        finalQuery += ` LIMIT ${finalTake}`;
      }

      // console.log('=== 최종 서브쿼리 쿼리 (LIMIT 추가) ===');
      // console.log(finalQuery);

      // 파라미터를 올바르게 바인딩하여 실행
      // queryParams는 이미 배열 형태이므로 그대로 사용
      groupKeys = await this.repo.manager.query(finalQuery, queryParams);
    } else {
      // LIMIT가 이미 생성되었다면 그대로 사용
      groupKeys = await subqueryBuilder.getRawMany();
    }

    // console.log('=== 서브쿼리 결과 (groupKeys) ===');
    // console.log('groupKeys.length:', groupKeys.length);
    // console.log('groupKeys:', groupKeys);

    if (groupKeys.length === 0) {
      return [];
    }

    // 디버깅: 그룹 키 구조 확인
    // groupKeys는 raw query 결과이므로 컬럼명이 대소문자를 구분할 수 있음
    // 예: { modelOrigin_id: 'value' } 또는 { modelOrigin_ID: 'value' } 등

    // 2단계: 가져온 그룹 키로 전체 집계 쿼리 수행
    const mainBuilder = await this.createGroupByBuilder(
      parsed,
      options,
      groupByParams,
    );

    // console.log('=== 메인 쿼리 (그룹 키 조건 추가 전) ===');
    // console.log(mainBuilder.getQuery());

    // 그룹 키 조건 추가 (IN 절)
    groupByParams.groupBy.forEach((field, index) => {
      // 서브쿼리에서 사용한 컬럼 alias 가져오기
      const columnAlias =
        fieldToColumnAlias.get(field) || field.replace('.', '_');

      // groupKeys에서 값 추출
      // getRawMany()는 컬럼 alias를 키로 사용하므로 정확한 alias 사용
      let values: any[] = [];
      if (groupKeys.length > 0) {
        // 정확한 키로 시도
        if (groupKeys[0][columnAlias] !== undefined) {
          values = groupKeys
            .map((gk) => gk[columnAlias])
            .filter((v) => v !== null && v !== undefined);
        } else {
          // 대소문자 변형 시도 (MySQL은 대소문자를 구분하지 않지만, 객체 키는 구분함)
          const actualKey = Object.keys(groupKeys[0]).find(
            (k) => k.toLowerCase() === columnAlias.toLowerCase(),
          );
          if (actualKey) {
            values = groupKeys
              .map((gk) => gk[actualKey])
              .filter((v) => v !== null && v !== undefined);
          } else {
            // 디버깅: 실제 키 확인
            console.warn(
              `Group key column alias not found: ${columnAlias}, available keys:`,
              Object.keys(groupKeys[0]),
            );
            // 첫 번째 컬럼 사용 (fallback)
            values = groupKeys
              .map((gk) => Object.values(gk)[0])
              .filter((v) => v !== null && v !== undefined);
          }
        }
      }

      let fieldWithAlias: string;
      if (field.includes('.')) {
        const [prefix, ...rest] = field.split('.');
        const actualJoinField = aliasToJoinField.get(prefix) || prefix;
        const actualAlias = joinOptions?.[actualJoinField]?.alias || prefix;
        fieldWithAlias = `${actualAlias}.${rest.join('.')}`;
      } else {
        fieldWithAlias = `${this.alias}.${field}`;
      }

      if (values.length > 0) {
        mainBuilder.andWhere(`${fieldWithAlias} IN (:...groupKey${index})`, {
          [`groupKey${index}`]: values,
        });
      }
    });

    // 정렬 적용 (서브쿼리와 동일한 정렬)
    this.setGroupBySort(mainBuilder, parsed, groupByParams);

    // console.log('=== 메인 쿼리 (최종) ===');
    // console.log(mainBuilder.getQuery());
    // console.log('메인 쿼리 파라미터:', mainBuilder.getParameters());

    // 전체 집계 쿼리 실행
    const results = await mainBuilder.getRawMany();

    // console.log('=== 메인 쿼리 결과 ===');
    // console.log('results.length:', results.length);
    // console.log('groupKeys.length:', groupKeys.length);

    // 서브쿼리에서 가져온 그룹 키 개수만큼만 반환 (페이징 보장)
    // GROUP BY 쿼리이므로 결과는 그룹 키 개수와 동일해야 하지만,
    // 안전을 위해 서브쿼리에서 가져온 그룹 키 개수로 제한
    const finalResults = results.slice(0, groupKeys.length);
    // console.log('finalResults.length:', finalResults.length);
    return finalResults;
  }

  /**
   * GroupBy용 정렬 설정
   */
  private setGroupBySort(
    builder: SelectQueryBuilder<T>,
    parsed: ParsedRequestParams,
    groupByParams: GroupByParams,
  ): void {
    const sort = parsed.sort;
    if (sort && sort.length) {
      const orderBy: Record<string, 'ASC' | 'DESC'> = {};

      for (const sortItem of sort) {
        let field = sortItem.field;
        let isAggregationAlias = false;

        // 집계 함수 결과로 정렬하는 경우
        if (groupByParams.aggregations) {
          const agg = groupByParams.aggregations.find(
            (a) =>
              a.alias === field ||
              `${a.function.toLowerCase()}_${a.field}` === field,
          );
          if (agg) {
            field = agg.alias || `${agg.function.toLowerCase()}_${agg.field}`;
            isAggregationAlias = true;
          }
        }

        // 그룹 필드로 정렬하는 경우
        if (!isAggregationAlias && groupByParams.groupBy.includes(field)) {
          field = field.includes('.') ? field : `${this.alias}.${field}`;
        }
        // 집계 함수나 그룹 필드가 아닌 경우, 테이블 alias가 없으면 메인 테이블 alias 추가
        // (JOIN된 여러 테이블에 동일한 컬럼명이 있을 때 모호성 방지)
        else if (!isAggregationAlias && !field.includes('.')) {
          field = `${this.alias}.${field}`;
        }

        orderBy[field] = sortItem.order;
      }

      builder.orderBy(orderBy);
    }
  }

  /**
   * [2025-05-18 최시훈] 자동 2단계 쿼리 패턴 적용
   *
   * GetMany의 OneToMany 조회 시 조회 속도 개선을 위해 자동으로 2단계 쿼리 패턴 적용
   * 1. id만 먼저 페이징
   * 2. id로 전체 상세 조회 (JOIN, OneToMany 포함)
   */
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  /**
   * [2025-05-18 최시훈] 자동 2단계 쿼리 패턴 적용
   * - OneToMany/ManyToMany join 시 2단계 쿼리로 페이징 성능 개선
   */

  // ---------------------------------
  // 유틸: relation 관련 join 키 추출
  // ---------------------------------
  private extractJoinFieldsFromSearch(search: any): Set<string> {
    const joinFields = new Set<string>();
    function deep(obj: any) {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (key.includes('.')) joinFields.add(key.split('.')[0]);
        if (Array.isArray(obj[key])) obj[key].forEach(deep);
        else if (typeof obj[key] === 'object') deep(obj[key]);
      }
    }
    deep(search);
    return joinFields;
  }

  // ---------------------------------
  // 유틸: requiredJoins 계산 (search/sort/alias)
  // ---------------------------------
  private getRequiredJoins(
    joinOptions: JoinOptions,
    parsed: ParsedRequestParams,
    excludeSort: boolean,
  ): Set<string> {
    const joinInSearch = this.extractJoinFieldsFromSearch(parsed.search);
    const aliasJoins = Object.entries(joinOptions).map(([key, value]) => ({
      key,
      value: value?.alias,
    }));
    const joinInSort = new Set<string>(
      (parsed.sort || [])
        .filter((s) => s.field?.includes('.'))
        .map((s) => s.field.split('.')[0]),
    );

    const requiredJoins = new Set<string>();

    // search/sort에서 추출한 모든 key와 매핑 alias를 required에 추가
    const addWithAlias = (jf: string) => {
      requiredJoins.add(jf);
      const map = aliasJoins.find((a) => a.value === jf);
      if (map) requiredJoins.add(map.key);
    };

    joinInSearch.forEach(addWithAlias);
    if (!excludeSort) {
      joinInSort.forEach(addWithAlias);
    }
    aliasJoins.forEach(({ key, value }) => {
      if (joinInSearch.has(value) || joinInSort.has(value))
        requiredJoins.add(key);
    });

    // 부모 경로까지 포함 (ex: a.b.c -> a.b, a)
    Array.from(requiredJoins).forEach((jf) => {
      const parts = jf.split('.');
      while (parts.length > 1) {
        parts.pop();
        requiredJoins.add(parts.join('.'));
      }
    });

    return requiredJoins;
  }

  // TypeOrmCrudService 내부
  /**
   * ---------------------------------
   * PK 페이징용: id만 조회 (DISTINCT·JOIN 최소화)
   *   · JOIN 은 **검색 또는 정렬에 필요한 테이블**만 건다.
   *   · 안쪽 SELECT 는 **정말 PK 하나만** 조회해 파생 테이블·filesort 를 없앤다.
   *   · 정렬은 PK 기준(ASC) 으로만 수행 → TypeORM 이 DISTINCT 서브쿼리를 만들지 않음.
   * ---------------------------------
   */
  protected async getPagedIds(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
    withDeleted = false,
  ): Promise<any[]> {
    const joinOptions = options.query?.join || {};
    const requiredJoins = this.getRequiredJoins(joinOptions, parsed, false);

    // 1) **PK 한 컬럼만** select
    const primaryKey = `${this.alias}.${this.entityPrimaryColumns[0]}`;
    const builder = this.repo
      .createQueryBuilder(this.alias)
      .select([primaryKey]);

    // 2) soft‑delete 조건
    if (this.entityHasDeleteColumn && options.query.softDelete) {
      if (parsed.includeDeleted === 1 || withDeleted) builder.withDeleted();
    }

    // 3) 검색 조건
    this.setSearchCondition(builder, parsed.search, options.operators?.custom);

    // 4) 검색·정렬용 JOIN (select=false)
    this.applyFilterJoinsOnly(
      builder,
      joinOptions,
      requiredJoins,
      parsed.join || [],
    );

    // set sort (order by)
    const sort = this.getSort(parsed, options.query);
    if (sort) {
      builder.orderBy(sort);
    }

    // 6) 페이징 (LIMIT/OFFSET)
    const take = this.getTake(parsed, options.query);
    if (isFinite(take)) builder.limit(take);
    const skip = this.getSkip(parsed, take);
    if (isFinite(skip)) builder.offset(skip);

    /**
     * [2025-07-11 최시훈] 만약 limit 값이 너무 크거나, 페이징이 없는데 너무 많은 데이터를 조회하려고 하면 오류를 발생시키고 종료
     *
     * 환경 변수 추가
     *     JSXCRUD_MAX_VALUE_GET_MANY_LIMIT: LIMIT의 최대값
     */
    const maxValueGetManyLimit = parseInt(
      process.env?.['JSXCRUD_MAX_VALUE_GET_MANY_LIMIT'] ?? '1000',
    );
    // Limit 제한 확인
    if (
      take !== null &&
      take !== undefined &&
      maxValueGetManyLimit !== null &&
      maxValueGetManyLimit !== undefined
    ) {
      if (take > maxValueGetManyLimit) {
        throw CommonError.createByErrorCode(
          GlbCoreTypeOrmError.JSX_CRUD_GET_MANY_LIMIT_EXCEEDED,
        );
      }
    }
    // 만약 LIMIT가 설정이 안되어 있다면, 강제로 maxValueGetManyLimit 값으로 설정
    if (
      take === null ||
      (take === undefined &&
        maxValueGetManyLimit !== null &&
        maxValueGetManyLimit !== undefined)
    ) {
      builder.limit(maxValueGetManyLimit);
    }

    // 7) 실행
    const [rows, total] = await builder.getManyAndCount();
    return [rows.map((r) => r[this.entityPrimaryColumns[0]]), total];
  }

  /**
   * 검색·정렬용 조인만 수행하는 헬퍼
   */
  private applyFilterJoinsOnly(
    builder: SelectQueryBuilder<T>,
    joinOptions: JoinOptions,
    requiredJoins: Set<string>,
    parsedJoins: QueryJoin[],
  ) {
    const allowedJoins = Object.keys(joinOptions);
    allowedJoins.forEach((joinField) => {
      if (joinOptions[joinField].eager && requiredJoins.has(joinField)) {
        const cond = parsedJoins.find((j) => j?.field === joinField) || {
          field: joinField,
        };
        this.setJoin(cond, joinOptions, builder);
      }
    });
  }

  // ---------------------------------
  // 2단계 자동 적용 getMany
  // ---------------------------------
  /**
   * GroupBy를 사용한 집계 쿼리 수행
   */
  public async getManyWithGroupBy<E>(
    req: CrudRequest & { parsed: ParsedRequestParams | any },
  ): Promise<GroupByResponse<E>> {
    const { parsed, options } = req;

    // 1. GroupBy 파라미터 파싱 및 검증
    const groupByParams = this.parseGroupByParams(req);
    if (!groupByParams) {
      throw CommonError.createByErrorCode(
        GlbCoreTypeOrmError.JSX_CRUD_BAD_REQUEST,
        'Invalid GroupBy parameters',
      );
    }

    this.validateGroupByParams(groupByParams);

    // 2. JOIN된 테이블 필드를 사용하는지 확인 (groupBy, where, order, aggregations 모두 확인)
    const joinOptions = options.query?.join || {};
    const hasJoinInQuery = this.hasJoinFieldInQuery(
      groupByParams,
      parsed,
      joinOptions,
    );
    const shouldUseSubquery =
      groupByParams.useSubqueryForJoinAggregations !== undefined
        ? groupByParams.useSubqueryForJoinAggregations
        : hasJoinInQuery; // 자동 감지

    // 3. 전체 그룹 수 조회 (페이징을 위해)
    const totalGroups = await this.getGroupByCount(
      parsed,
      options,
      groupByParams,
    );

    let rawResults: any[];

    if (shouldUseSubquery && hasJoinInQuery) {
      // // 서브쿼리 패턴 사용: 먼저 그룹 키만 가져오고 LIMIT 적용, 그 다음 전체 집계 수행
      // console.log('=== 서브쿼리 패턴 사용 ===');
      // console.log('shouldUseSubquery:', shouldUseSubquery);
      // console.log('hasJoinInQuery:', hasJoinInQuery);
      rawResults = await this.getManyWithGroupByUsingSubquery<E>(
        parsed,
        options,
        groupByParams,
      );
    } else {
      // 기존 방식: 단일 쿼리 사용
      const builder = await this.createGroupByBuilder(
        parsed,
        options,
        groupByParams,
      );

      // 4. 정렬 적용
      this.setGroupBySort(builder, parsed, groupByParams);

      // 5. 페이징 적용
      const { take, skip } = this.getGroupByPaging(parsed, options);
      if (take !== null && isFinite(take)) {
        builder.take(take);
      }
      if (skip !== null && isFinite(skip)) {
        builder.skip(skip);
      }

      // 6. LIMIT 제한 확인 (기존 getMany와 동일한 로직)
      const maxValueGetManyLimit = parseInt(
        process.env?.['JSXCRUD_MAX_VALUE_GET_MANY_LIMIT'] ?? '1000',
      );
      if (
        take !== null &&
        take !== undefined &&
        maxValueGetManyLimit !== null &&
        maxValueGetManyLimit !== undefined
      ) {
        if (take > maxValueGetManyLimit) {
          throw CommonError.createByErrorCode(
            GlbCoreTypeOrmError.JSX_CRUD_GET_MANY_LIMIT_EXCEEDED,
          );
        }
      }
      // 만약 LIMIT가 설정이 안되어 있다면, 강제로 maxValueGetManyLimit 값으로 설정
      if (
        take === null ||
        (take === undefined &&
          maxValueGetManyLimit !== null &&
          maxValueGetManyLimit !== undefined)
      ) {
        builder.take(maxValueGetManyLimit);
      }

      // 7. 쿼리 실행
      rawResults = await builder.getRawMany();
    }

    // 8. 결과 변환
    const data = this.transformGroupByResults<E>(rawResults, groupByParams);

    // 9. 응답 생성
    return this.createGroupByResponse<E>(data, totalGroups, parsed, options);
  }

  public async getManyGroupBy<E>(
    req: CrudRequest & { parsed: ParsedRequestParams | any },
  ): Promise<GroupByResponse<E> | null> {
    // GroupBy 요청 체크
    const groupByParams = this.parseGroupByParams(req);
    if (groupByParams) {
      return this.getManyWithGroupBy<E>(req);
    }

    throw CommonError.createByErrorCode(
      GlbCoreTypeOrmError.JSX_CRUD_BAD_REQUEST,
      'Invalid GroupBy parameters',
    );
  }

  public async getMany(
    req: CrudRequest,
  ): Promise<GetManyDefaultResponse<T> | T[]> {
    const { parsed, options } = req;

    // ----- Step 1-1: total row count (id 페이징과 동일 조건) -----
    const limit = this.getTake(parsed, options.query || {});
    const aliasJoins = options.query?.join
      ? Object.entries(options.query.join).map(([key, value]) => ({
          key,
          value: value?.alias,
        }))
      : [];

    // ---------------------------------
    // 조인 대상에 OneToMany/ManyToMany 포함되어 있는지
    // ---------------------------------
    const joins = options.query?.join ? Object.keys(options.query.join) : [];
    const sorts = parsed.sort ? parsed.sort : [];
    const sortsWithOriginal = sorts.map((item) => {
      return {
        key: item.field,
        value: item,
      };
    });
    const sortsWithAlias = sorts.map((item) => {
      const topLevel = item?.field?.split('.')[0];
      const alias = aliasJoins.find((a) => a.value === topLevel)?.key;
      return {
        key: alias || topLevel,
        value: item,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const hasCollectionJoin = joins.some((joinField) => {
      // const topLevel = joinField.split('.')[0];
      // const rel = this.repo.metadata.relations.find(
      //   (r) => r.propertyName === topLevel
      // );
      // return rel && (rel.isOneToMany || rel.isManyToMany);

      return true;
    });
    const hasSortOriginalIsRequiredCollectionJoin = sortsWithOriginal.some(
      (item) => {
        const rel = this.repo.metadata.relations.find(
          (r) => r.propertyName === item.key,
        );
        return rel && (rel.isOneToMany || rel.isManyToMany);
      },
    );
    const hasSortAliasIsRequiredCollectionJoin = sortsWithAlias.some((item) => {
      const rel = this.repo.metadata.relations.find(
        (r) => r.propertyName === item.key,
      );
      return rel && (rel.isOneToMany || rel.isManyToMany);
    });

    if (
      !hasCollectionJoin ||
      hasSortAliasIsRequiredCollectionJoin ||
      hasSortOriginalIsRequiredCollectionJoin
    ) {
      const builder = await this.createBuilder(parsed, options);
      return this.doGetMany(builder, parsed, options);
    }
    // ---------------------------------

    // ----- Step 1-2: id만 페이징 -----
    const [ids, total] = await this.getPagedIds(parsed, options);
    if (!ids.length) return this.createPageInfo([], total, 0, 0);

    // ----- Step 2: id IN 상세조회 -----
    const pkCol = this.entityPrimaryColumns[0];
    const inCond = { [pkCol]: { $in: ids } };
    const baseSearch = parsed.search || {};
    const newSearch = baseSearch.$and
      ? { ...baseSearch, $and: [...baseSearch.$and, inCond] }
      : Object.keys(baseSearch).length
        ? { $and: [baseSearch, inCond] }
        : inCond;

    const newParsed = {
      ...parsed,
      search: newSearch,
      page: undefined,
      limit: undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any as ParsedRequestParams;

    const builder = await this.createBuilder(newParsed, options);
    const data = await builder.getMany();

    if (limit === undefined || limit === null) {
      return data;
    }

    return this.createPageInfoForGetManyCustom(
      data,
      total,
      parsed?.page || 1,
      limit ? Math.ceil(total / limit) : 1,
    );
  }
  /**
   * 원본 코드는 주석처리
   */
  // /**
  //  * Get many
  //  * @param req
  //  */
  // public async getMany(
  //   req: CrudRequest
  // ): Promise<GetManyDefaultResponse<T> | T[]> {
  //   const { parsed, options } = req;
  //   const builder = await this.createBuilder(parsed, options);
  //   return this.doGetMany(builder, parsed, options);
  // }
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------

  /**
   * Get one
   * @param req
   */
  public async getOne(req: CrudRequest): Promise<T> {
    return this.getOneOrFail(req);
  }

  /**
   * Create one
   * @param req
   * @param dto
   */
  public async createOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T> {
    const { returnShallow } = req.options.routes.createOneBase;
    const entity = this.prepareEntityBeforeSave(dto, req.parsed);

    /* istanbul ignore if */
    if (!entity) {
      this.throwBadRequestException(`Empty data. Nothing to save.`);
    }

    const saved = await this.repo.save<any>(entity);

    if (returnShallow) {
      return saved;
    } else {
      const primaryParams = this.getPrimaryParams(req.options);

      /* istanbul ignore next */
      if (!primaryParams.length && primaryParams.some((p) => isNil(saved[p]))) {
        return saved;
      } else {
        req.parsed.search = primaryParams.reduce(
          (acc, p) => ({ ...acc, [p]: saved[p] }),
          {},
        );
        return this.getOneOrFail(req);
      }
    }
  }

  /**
   * Create many
   * @param req
   * @param dto
   */
  public async createMany(
    req: CrudRequest,
    dto: CreateManyDto<DeepPartial<T>>,
  ): Promise<T[]> {
    /* istanbul ignore if */
    if (!isObject(dto) || !isArrayFull(dto.bulk)) {
      this.throwBadRequestException(`Empty data. Nothing to save.`);
    }

    const bulk = dto.bulk
      .map((one) => this.prepareEntityBeforeSave(one, req.parsed))
      .filter((d) => !isUndefined(d));

    /* istanbul ignore if */
    if (!hasLength(bulk)) {
      this.throwBadRequestException(`Empty data. Nothing to save.`);
    }

    return this.repo.save<any>(bulk, { chunk: 50 });
  }

  /**
   * Update one
   * @param req
   * @param dto
   */
  public async updateOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T> {
    const { allowParamsOverride, returnShallow } =
      req.options.routes.updateOneBase;
    const paramsFilters = this.getParamFilters(req.parsed);
    // disable cache while updating
    req.options.query.cache = false;
    const found = await this.getOneOrFail(req, returnShallow);

    const toSave = !allowParamsOverride
      ? { ...found, ...dto, ...paramsFilters, ...req.parsed.authPersist }
      : { ...found, ...dto, ...req.parsed.authPersist };
    const updated = await this.repo.save(
      plainToClass(
        this.entityType,
        toSave,
        req.parsed.classTransformOptions,
      ) as unknown as DeepPartial<T>,
    );

    if (returnShallow) {
      return updated;
    } else {
      req.parsed.paramsFilter.forEach((filter) => {
        filter.value = updated[filter.field];
      });

      return this.getOneOrFail(req);
    }
  }

  /**
   * Recover one
   * @param req
   * @param dto
   */
  public async recoverOne(req: CrudRequest): Promise<T> {
    // disable cache while recovering
    req.options.query.cache = false;
    const found = await this.getOneOrFail(req, false, true);
    return this.repo.recover(found as DeepPartial<T>);
  }

  /**
   * Replace one
   * @param req
   * @param dto
   */
  public async replaceOne(req: CrudRequest, dto: DeepPartial<T>): Promise<T> {
    const { allowParamsOverride, returnShallow } =
      req.options.routes.replaceOneBase;
    const paramsFilters = this.getParamFilters(req.parsed);
    // disable cache while replacing
    req.options.query.cache = false;
    const [_, found] = await oO(this.getOneOrFail(req, returnShallow));
    const toSave = !allowParamsOverride
      ? {
          ...(found || {}),
          ...dto,
          ...paramsFilters,
          ...req.parsed.authPersist,
        }
      : {
          ...(found || /* istanbul ignore next */ {}),
          ...paramsFilters,
          ...dto,
          ...req.parsed.authPersist,
        };
    const replaced = await this.repo.save(
      plainToClass(
        this.entityType,
        toSave,
        req.parsed.classTransformOptions,
      ) as unknown as DeepPartial<T>,
    );

    if (returnShallow) {
      return replaced;
    } else {
      const primaryParams = this.getPrimaryParams(req.options);

      /* istanbul ignore if */
      if (!primaryParams.length) {
        return replaced;
      }

      req.parsed.search = primaryParams.reduce(
        (acc, p) => ({ ...acc, [p]: replaced[p] }),
        {},
      );
      return this.getOneOrFail(req);
    }
  }

  /**
   * Delete one
   * @param req
   */
  public async deleteOne(req: CrudRequest): Promise<void | T> {
    const { returnDeleted } = req.options.routes.deleteOneBase;
    // disable cache while deleting
    req.options.query.cache = false;
    const found = await this.getOneOrFail(req, returnDeleted);
    const toReturn = returnDeleted
      ? plainToClass(
          this.entityType,
          { ...found },
          req.parsed.classTransformOptions,
        )
      : undefined;
    const deleted =
      req.options.query.softDelete === true
        ? await this.repo.softRemove(found as DeepPartial<T>)
        : await this.repo.remove(found);
    return toReturn;
  }

  public getParamFilters(parsed: CrudRequest['parsed']): ObjectLiteral {
    const filters = {};

    /* istanbul ignore else */
    if (hasLength(parsed.paramsFilter)) {
      for (const filter of parsed.paramsFilter) {
        filters[filter.field] = filter.value;
      }
    }

    return filters;
  }

  /**
   * Create TypeOrm QueryBuilder
   * @param parsed
   * @param options
   * @param many
   */
  public async createBuilder(
    parsed: ParsedRequestParams,
    options: CrudRequestOptions,
    many = true,
    withDeleted = false,
  ): Promise<SelectQueryBuilder<T>> {
    // create query builder
    const builder = this.repo.createQueryBuilder(this.alias);
    // get select fields
    const select = this.getSelect(parsed, options.query);

    // select fields
    builder.select(select);

    // if soft deleted is enabled add where statement to filter deleted records
    if (this.entityHasDeleteColumn && options.query.softDelete) {
      if (parsed.includeDeleted === 1 || withDeleted) {
        builder.withDeleted();
      }
    }

    // search
    this.setSearchCondition(builder, parsed.search, options.operators?.custom);

    // set joins
    const joinOptions = options.query?.join || {};
    const allowedJoins = objKeys(joinOptions);

    if (hasLength(allowedJoins)) {
      const eagerJoins: any = {};

      for (let i = 0; i < allowedJoins.length; i++) {
        /* istanbul ignore else */
        if (joinOptions[allowedJoins[i]].eager) {
          const cond = parsed.join.find(
            (j) => j && j.field === allowedJoins[i],
          ) || {
            field: allowedJoins[i],
          };

          this.setJoin(cond, joinOptions, builder);
          eagerJoins[allowedJoins[i]] = true;
        }
      }

      if (isArrayFull(parsed.join)) {
        for (let i = 0; i < parsed.join.length; i++) {
          /* istanbul ignore else */
          if (!eagerJoins[parsed.join[i].field]) {
            this.setJoin(parsed.join[i], joinOptions, builder);
          }
        }
      }
    }

    /* istanbul ignore else */
    if (many) {
      // set sort (order by)
      const sort = this.getSort(parsed, options.query);
      builder.orderBy(sort);

      // set take
      const take = this.getTake(parsed, options.query);
      /* istanbul ignore else */
      if (isFinite(take)) {
        builder.take(take);
      }

      // set skip
      const skip = this.getSkip(parsed, take);
      /* istanbul ignore else */
      if (isFinite(skip)) {
        builder.skip(skip);
      }
    }

    // set cache
    /* istanbul ignore else */
    if (options.query.cache && parsed.cache !== 0) {
      builder.cache(options.query.cache);
    }
    // ---------------------------------

    return builder;
  }

  /**
   * 쿼리 최적화 이전 코드
   * [수정자] 최시훈 2025.04.07 - 쓸모 없는 JOIN 제거
   */
  /**
   * depends on paging call SelectQueryBuilder#getMany or SelectQueryBuilder#getManyAndCount
   * helpful for overriding TypeOrmCrudService#getMany
   * @see getMany
   * @see SelectQueryBuilder#getMany
   * @see SelectQueryBuilder#getManyAndCount
   * @param builder
   * @param query
   * @param options
   */
  protected async doGetMany(
    builder: SelectQueryBuilder<T>,
    query: ParsedRequestParams,
    options: CrudRequestOptions,
  ): Promise<GetManyDefaultResponse<T> | T[]> {
    if (this.decidePagination(query, options)) {
      const [data, total] = await builder.getManyAndCount();
      const limit = builder.expressionMap.take;
      const offset = builder.expressionMap.skip;
      return this.createPageInfo(data, total, limit || total, offset || 0);
    }
    return builder.getMany();
  }

  protected onInitMapEntityColumns() {
    /**
     * 오류가 발생하면 이부분 수정
     */
    this.entityColumns = this.repo.metadata.columns.map((prop) => {
      // In case column is an embedded, use the propertyPath to get complete path
      if (prop.embeddedMetadata) {
        this.entityColumnsHash[prop.propertyPath] = prop.databasePath;
        return prop.propertyPath;
      }

      this.entityColumnsHash[prop.propertyName] = prop.databaseName;
      return prop.propertyName;
    });
    this.entityPrimaryColumns = this.repo.metadata.columns
      .filter((prop) => prop.isPrimary)
      .map((prop) => prop.propertyName);
    this.entityHasDeleteColumn =
      this.repo.metadata.columns.filter((prop) => prop.isDeleteDate).length > 0;
  }

  protected async getOneOrFail(
    req: CrudRequest,
    shallow = false,
    withDeleted = false,
  ): Promise<T> {
    const { parsed, options } = req;
    const builder = shallow
      ? this.repo.createQueryBuilder(this.alias)
      : await this.createBuilder(parsed, options, true, withDeleted);

    if (shallow) {
      this.setSearchCondition(
        builder,
        parsed.search,
        options.operators?.custom,
      );
    }

    const found = withDeleted
      ? await builder.withDeleted().getOne()
      : await builder.getOne();

    if (!found) {
      this.throwNotFoundException(this.alias);
    }

    return found;
  }

  protected prepareEntityBeforeSave(
    dto: DeepPartial<T>,
    parsed: CrudRequest['parsed'],
  ): T {
    /* istanbul ignore if */
    if (!isObject(dto)) {
      return undefined;
    }

    if (hasLength(parsed.paramsFilter)) {
      for (const filter of parsed.paramsFilter) {
        dto[filter.field] = filter.value;
      }
    }

    /* istanbul ignore if */
    if (!hasLength(objKeys(dto))) {
      return undefined;
    }

    return dto instanceof this.entityType
      ? Object.assign(dto, parsed.authPersist)
      : plainToClass(
          this.entityType,
          { ...dto, ...parsed.authPersist },
          parsed.classTransformOptions,
        );
  }

  protected getAllowedColumns(
    columns: string[],
    options: QueryOptions,
  ): string[] {
    return (!options.exclude || !options.exclude.length) &&
      (!options.allow || /* istanbul ignore next */ !options.allow.length)
      ? columns
      : columns.filter(
          (column) =>
            (options.exclude && options.exclude.length
              ? !options.exclude.some((col) => col === column)
              : /* istanbul ignore next */ true) &&
            (options.allow && options.allow.length
              ? options.allow.some((col) => col === column)
              : /* istanbul ignore next */ true),
        );
  }

  protected getEntityColumns(entityMetadata: EntityMetadata): {
    columns: string[];
    primaryColumns: string[];
  } {
    const columns =
      entityMetadata.columns.map((prop) => prop.propertyPath) ||
      /* istanbul ignore next */ [];
    const primaryColumns =
      entityMetadata.primaryColumns.map((prop) => prop.propertyPath) ||
      /* istanbul ignore next */ [];

    return { columns, primaryColumns };
  }

  protected getRelationMetadata(
    field: string,
    options: JoinOption,
  ): IAllowedRelation {
    try {
      let allowedRelation;
      let nested = false;

      if (this.entityRelationsHash.has(field)) {
        allowedRelation = this.entityRelationsHash.get(field);
      } else {
        const fields = field.split('.');
        let relationMetadata: EntityMetadata;
        let name: string;
        let path: string;
        let parentPath: string;

        if (fields.length === 1) {
          const found = this.repo.metadata.relations.find(
            (one) => one.propertyName === fields[0],
          );

          if (found) {
            name = fields[0];
            path = `${this.alias}.${fields[0]}`;
            relationMetadata = found.inverseEntityMetadata;
          }
        } else {
          nested = true;
          parentPath = '';

          const reduced = fields.reduce(
            (res, propertyName: string, i) => {
              const found = res.relations.length
                ? res.relations.find((one) => one.propertyName === propertyName)
                : null;
              relationMetadata = found ? found.inverseEntityMetadata : null;
              const relations = relationMetadata
                ? relationMetadata.relations
                : [];
              name = propertyName;

              if (i !== fields.length - 1) {
                parentPath = !parentPath
                  ? propertyName
                  : /* istanbul ignore next */ `${parentPath}.${propertyName}`;
              }

              return {
                relations,
                relationMetadata,
              };
            },
            {
              relations: this.repo.metadata.relations,
              relationMetadata: null,
            },
          );

          relationMetadata = reduced.relationMetadata;
        }

        if (relationMetadata) {
          const { columns, primaryColumns } =
            this.getEntityColumns(relationMetadata);

          if (!path && parentPath) {
            const parentAllowedRelation =
              this.entityRelationsHash.get(parentPath);

            /* istanbul ignore next */
            if (parentAllowedRelation) {
              path = parentAllowedRelation.alias
                ? `${parentAllowedRelation.alias}.${name}`
                : field;
            }
          }

          allowedRelation = {
            alias: options.alias,
            name,
            path,
            columns,
            nested,
            primaryColumns,
          };
        }
      }

      if (allowedRelation) {
        const allowedColumns = this.getAllowedColumns(
          allowedRelation.columns,
          options,
        );
        const toSave: IAllowedRelation = { ...allowedRelation, allowedColumns };

        this.entityRelationsHash.set(field, toSave);

        if (options.alias) {
          this.entityRelationsHash.set(options.alias, toSave);
        }

        return toSave;
      }
    } catch (_) {
      /* istanbul ignore next */
      return null;
    }
  }

  private convertArrayToQuery(
    data: { str: string; params: { [key: string]: any } }[],
  ): {
    str: string;
    params: { [key: string]: any };
  } {
    const queryStringParts: string[] = [];
    const params: { [key: string]: any } = {};

    for (const item of data) {
      const { str, params: itemParams } = item;
      queryStringParts.push(str);
      Object.assign(params, itemParams);
    }

    const combinedString = queryStringParts.join(' AND ');

    return { str: combinedString, params };
  }

  protected setJoin(
    cond: QueryJoin,
    joinOptions: JoinOptions,
    builder: SelectQueryBuilder<T>,
  ) {
    const options = joinOptions[cond.field];

    if (!options) {
      console.warn(
        'relation "' +
          cond.field +
          '" not found in allowed relations in the controller. Did you mean to use one of these? [' +
          Object.keys(joinOptions).join(', ') +
          ']',
      );
      return true;
    }

    const allowedRelation = this.getRelationMetadata(cond.field, options);

    if (!allowedRelation) {
      return true;
    }

    const relationType = options.required ? 'innerJoin' : 'leftJoin';
    const alias = options.alias ? options.alias : allowedRelation.name;

    if (cond.on) {
      const conds = cond.on.map((condition, i) =>
        this.mapOperatorsToQuery(condition, `andCondition${i}`, {}),
      );
      const { str, params } = this.convertArrayToQuery(conds);
      builder[relationType](allowedRelation.path, alias, str, params);
    } else {
      builder[relationType](allowedRelation.path, alias);
    }

    if (options.select !== false) {
      const columns = isArrayFull(cond.select)
        ? cond.select.filter((column) =>
            allowedRelation.allowedColumns.some(
              (allowed) => allowed === column,
            ),
          )
        : allowedRelation.allowedColumns;

      const select = [
        ...new Set([
          ...allowedRelation.primaryColumns,
          ...(isArrayFull(options.persist) ? options.persist : []),
          ...columns,
        ]),
      ].map((col) => `${alias}.${col}`);
      builder.addSelect(Array.from(new Set(select)));
    }
  }

  protected setAndWhere(
    cond: QueryFilter,
    i: any,
    builder: SelectQueryBuilder<T> | WhereExpressionBuilder,
    customOperators: CustomOperators,
  ) {
    const { str, params } = this.mapOperatorsToQuery(
      cond,
      `andWhere${i}`,
      customOperators,
    );
    builder.andWhere(str, params);
  }

  protected setOrWhere(
    cond: QueryFilter,
    i: any,
    builder: SelectQueryBuilder<T> | WhereExpressionBuilder,
    customOperators: CustomOperators,
  ) {
    const { str, params } = this.mapOperatorsToQuery(
      cond,
      `orWhere${i}`,
      customOperators,
    );
    builder.orWhere(str, params);
  }

  protected setSearchCondition(
    builder: SelectQueryBuilder<T>,
    search: SCondition,
    customOperators: CustomOperators,
    condition: SConditionKey = '$and',
  ) {
    /* istanbul ignore else */
    if (isObject(search)) {
      const keys = objKeys(search);
      /* istanbul ignore else */
      if (keys.length) {
        // search: {$not: [...]}
        if (isArrayFull(search.$not)) {
          this.builderAddBrackets(
            builder,
            condition,
            new Brackets((qb: any) => {
              search.$not.forEach((item: any) => {
                this.setSearchCondition(qb, item, customOperators, '$and');
              });
            }),
            true,
          );
        }
        // search: {$and: [...], ...}
        else if (isArrayFull(search.$and)) {
          // search: {$and: [{}]}
          if (search.$and.length === 1) {
            this.setSearchCondition(
              builder,
              search.$and[0],
              customOperators,
              condition,
            );
          }
          // search: {$and: [{}, {}, ...]}
          else {
            this.builderAddBrackets(
              builder,
              condition,
              new Brackets((qb: SelectQueryBuilder<T>) => {
                search.$and?.forEach((item: any) => {
                  this.setSearchCondition(qb, item, customOperators, '$and');
                });
              }),
            );
          }
        }
        // search: {$or: [...], ...}
        else if (isArrayFull(search.$or)) {
          // search: {$or: [...]}
          if (keys.length === 1) {
            // search: {$or: [{}]}
            if (search.$or.length === 1) {
              this.setSearchCondition(
                builder,
                search.$or[0],
                customOperators,
                condition,
              );
            }
            // search: {$or: [{}, {}, ...]}
            else {
              this.builderAddBrackets(
                builder,
                condition,
                new Brackets((qb: any) => {
                  search.$or.forEach((item: any) => {
                    this.setSearchCondition(qb, item, customOperators, '$or');
                  });
                }),
              );
            }
          }
          // search: {$or: [...], foo, ...}
          else {
            this.builderAddBrackets(
              builder,
              condition,
              new Brackets((qb: any) => {
                keys.forEach((field: string) => {
                  if (field !== '$or') {
                    const value = search[field];
                    if (!isObject(value)) {
                      this.builderSetWhere(
                        qb,
                        '$and',
                        field,
                        value,
                        customOperators,
                      );
                    } else {
                      this.setSearchFieldObjectCondition(
                        qb,
                        '$and',
                        field,
                        value,
                        customOperators,
                      );
                    }
                  } else {
                    if (search.$or.length === 1) {
                      this.setSearchCondition(
                        builder,
                        search.$or[0],
                        customOperators,
                        '$and',
                      );
                    } else {
                      this.builderAddBrackets(
                        qb,
                        '$and',
                        new Brackets((qb2: any) => {
                          search.$or.forEach((item: any) => {
                            this.setSearchCondition(
                              qb2,
                              item,
                              customOperators,
                              '$or',
                            );
                          });
                        }),
                      );
                    }
                  }
                });
              }),
            );
          }
        }
        // search: {...}
        else {
          // search: {foo}
          if (keys.length === 1) {
            const field = keys[0];
            const value = search[field];
            if (!isObject(value)) {
              this.builderSetWhere(
                builder,
                condition,
                field,
                value,
                customOperators,
              );
            } else {
              this.setSearchFieldObjectCondition(
                builder,
                condition,
                field,
                value,
                customOperators,
              );
            }
          }
          // search: {foo, ...}
          else {
            this.builderAddBrackets(
              builder,
              condition,
              new Brackets((qb: any) => {
                keys.forEach((field: string) => {
                  const value = search[field];
                  if (!isObject(value)) {
                    this.builderSetWhere(
                      qb,
                      '$and',
                      field,
                      value,
                      customOperators,
                    );
                  } else {
                    this.setSearchFieldObjectCondition(
                      qb,
                      '$and',
                      field,
                      value,
                      customOperators,
                    );
                  }
                });
              }),
            );
          }
        }
      }
    }
  }

  protected builderAddBrackets(
    builder: SelectQueryBuilder<T>,
    condition: SConditionKey,
    brackets: Brackets,
    negated: boolean = false,
  ) {
    if (negated) {
      // No builtin support for not, this is copied from QueryBuilder.getWhereCondition

      const whereQueryBuilder = builder.createQueryBuilder();

      (whereQueryBuilder as any).parentQueryBuilder = builder;

      whereQueryBuilder.expressionMap.mainAlias =
        builder.expressionMap.mainAlias;
      whereQueryBuilder.expressionMap.aliasNamePrefixingEnabled =
        builder.expressionMap.aliasNamePrefixingEnabled;
      whereQueryBuilder.expressionMap.parameters =
        builder.expressionMap.parameters;
      whereQueryBuilder.expressionMap.nativeParameters =
        builder.expressionMap.nativeParameters;

      whereQueryBuilder.expressionMap.wheres = [];

      brackets.whereFactory(whereQueryBuilder as any);

      const wheres = {
        operator: 'brackets',
        condition: whereQueryBuilder.expressionMap.wheres,
      };

      const type =
        condition === '$and' ? 'and' : condition === '$or' ? 'or' : 'simple';
      builder.expressionMap.wheres.push({
        type,
        condition: {
          operator: 'not',
          condition: wheres as any,
        },
      });
    } else if (condition === '$and') {
      builder.andWhere(brackets);
    } else {
      builder.orWhere(brackets);
    }
  }

  protected builderSetWhere(
    builder: SelectQueryBuilder<T>,
    condition: SConditionKey,
    field: string,
    value: any,
    customOperators: CustomOperators,
    operator: ComparisonOperator = '$eq',
  ) {
    const time = process.hrtime();
    // const index = `${field}${time[0]}${time[1]}`;
    /**
     * Correcting the Error [Invalid Column Name] or [ syntax error at or near \":\".]
     * When using filter or search in relational/nested entities.
     */
    const safeFieldName = field.replace(/./g, '_');
    const index = `${safeFieldName}${time[0]}${time[1]}`;

    const options = [
      { field, operator: isNull(value) ? '$isnull' : operator, value },
      index,
      builder,
      customOperators,
    ];
    const fn = condition === '$and' ? this.setAndWhere : this.setOrWhere;
    fn.apply(this, options);
  }

  protected setSearchFieldObjectCondition(
    builder: SelectQueryBuilder<T>,
    condition: SConditionKey,
    field: string,
    object: any,
    customOperators: CustomOperators,
  ) {
    /* istanbul ignore else */
    if (isObject(object)) {
      const operators = objKeys(object);

      if (operators.length === 1 && operators[0] !== '$or') {
        const operator = operators[0] as ComparisonOperator;
        const value = object[operator];
        this.builderSetWhere(
          builder,
          condition,
          field,
          value,
          customOperators,
          operator,
        );
      } else {
        this.builderAddBrackets(
          builder,
          condition,
          new Brackets((qb: any) => {
            operators.forEach((operator: ComparisonOperator) => {
              const value = object[operator];

              if (operator !== '$or') {
                this.builderSetWhere(
                  qb,
                  condition,
                  field,
                  value,
                  customOperators,
                  operator,
                );
              } else {
                const orKeys = objKeys(object.$or);

                if (orKeys.length === 1) {
                  this.setSearchFieldObjectCondition(
                    qb,
                    condition,
                    field,
                    object.$or,
                    customOperators,
                  );
                } else {
                  this.builderAddBrackets(
                    qb,
                    condition,
                    new Brackets((qb2: any) => {
                      this.setSearchFieldObjectCondition(
                        qb2,
                        '$or',
                        field,
                        object.$or,
                        customOperators,
                      );
                    }),
                  );
                }
              }
            });
          }),
        );
      }
    }
  }

  protected getSelect(
    query: ParsedRequestParams,
    options: QueryOptions,
  ): string[] {
    const allowed = this.getAllowedColumns(this.entityColumns, options);

    const columns =
      query.fields && query.fields.length
        ? query.fields.filter((field) => allowed.some((col) => field === col))
        : allowed;

    const select = [
      ...new Set([
        ...(options.persist && options.persist.length ? options.persist : []),
        ...columns,
        ...this.entityPrimaryColumns,
      ]),
    ].map((col) => `${this.alias}.${col}`);

    return Array.from(new Set(select));
  }

  protected getSort(query: ParsedRequestParams, options: QueryOptions) {
    return query.sort && query.sort.length
      ? this.mapSort(query.sort)
      : options.sort && options.sort.length
        ? this.mapSort(options.sort)
        : {};
  }

  protected getFieldWithAlias(field: string, sort: boolean = false) {
    /* istanbul ignore next */
    const i = ['mysql', 'mariadb'].includes(this.dbName) ? '`' : '"';
    const cols = field.split('.');

    switch (cols.length) {
      case 1:
        if (sort) {
          return `${this.alias}.${field}`;
        }

        const dbColName =
          this.entityColumnsHash[field] !== field
            ? this.entityColumnsHash[field]
            : field;
        return `${i}${this.alias}${i}.${i}${dbColName}${i}`;
      case 2:
        return field;
      default:
        return cols.slice(cols.length - 2, cols.length).join('.');
    }
  }

  protected mapSort(sort: QuerySort[]) {
    const params: ObjectLiteral = {};

    for (let i = 0; i < sort.length; i++) {
      const field = this.getFieldWithAlias(sort[i].field, true);
      const checkedFiled = this.checkSqlInjection(field);
      params[checkedFiled] = sort[i].order;
    }

    return params;
  }

  protected mapOperatorsToQuery(
    cond: QueryFilter,
    param: any,
    customOperators: CustomOperators = {},
  ): { str: string; params: ObjectLiteral } {
    const field = this.getFieldWithAlias(cond.field);

    const likeOperator =
      this.dbName === 'postgres' ? 'ILIKE' : /* istanbul ignore next */ 'LIKE';
    let str: string;
    // NOTE: may be overridden by specific operators
    let params: ObjectLiteral = { [param]: cond.value };

    if (cond.operator[0] !== '$') {
      cond.operator = ('$' + cond.operator) as ComparisonOperator;
    }

    switch (cond.operator) {
      case '$eq':
        str = `${field} = :${param}`;
        break;

      case '$ne':
        str = `${field} != :${param}`;
        break;

      case '$gt':
        str = `${field} > :${param}`;
        break;

      case '$lt':
        str = `${field} < :${param}`;
        break;

      case '$gte':
        str = `${field} >= :${param}`;
        break;

      case '$lte':
        str = `${field} <= :${param}`;
        break;

      case '$starts':
        str = `${field} LIKE :${param}`;
        params = { [param]: `${cond.value}%` };
        break;

      case '$ends':
        str = `${field} LIKE :${param}`;
        params = { [param]: `%${cond.value}` };
        break;

      case '$cont':
        str = `${field} LIKE :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case '$excl':
        str = `${field} NOT LIKE :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case '$in':
        this.checkFilterIsArray(cond);
        str = `${field} IN (:...${param})`;
        break;

      case '$notin':
        this.checkFilterIsArray(cond);
        str = `${field} NOT IN (:...${param})`;
        break;

      case '$isnull':
        str = `${field} IS NULL`;
        params = {};
        break;

      case '$notnull':
        str = `${field} IS NOT NULL`;
        params = {};
        break;

      case '$between':
        this.checkFilterIsArray(cond, cond.value.length !== 2);
        str = `${field} BETWEEN :${param}0 AND :${param}1`;
        params = {
          [`${param}0`]: cond.value[0],
          [`${param}1`]: cond.value[1],
        };
        break;

      // case insensitive
      case '$eqL':
        str = `LOWER(${field}) = :${param}`;
        break;

      case '$neL':
        str = `LOWER(${field}) != :${param}`;
        break;

      case '$startsL':
        str = `LOWER(${field}) ${likeOperator} :${param}`;
        params = { [param]: `${cond.value}%` };
        break;

      case '$endsL':
        str = `LOWER(${field}) ${likeOperator} :${param}`;
        params = { [param]: `%${cond.value}` };
        break;

      case '$contL':
        str = `LOWER(${field}) ${likeOperator} :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case '$exclL':
        str = `LOWER(${field}) NOT ${likeOperator} :${param}`;
        params = { [param]: `%${cond.value}%` };
        break;

      case '$inL':
        this.checkFilterIsArray(cond);
        str = `LOWER(${field}) IN (:...${param})`;
        break;

      case '$notinL':
        this.checkFilterIsArray(cond);
        str = `LOWER(${field}) NOT IN (:...${param})`;
        break;

      case '$contArr':
        this.checkFilterIsArray(cond);
        str = `${field} @> ARRAY[:...${param}]::${this.getColumnType(
          cond.field,
        )}[]`;
        break;

      case '$intersectsArr':
        this.checkFilterIsArray(cond);
        str = `${field} && ARRAY[:...${param}]::${this.getColumnType(
          cond.field,
        )}[]`;
        break;

      /* istanbul ignore next */
      default:
        const customOperator = customOperators[cond.operator];
        if (!customOperator) {
          str = `${field} = :${param}`;
          break;
        }

        try {
          if (customOperator.isArray) {
            this.checkFilterIsArray(cond);
          }
          str = customOperator.query(field, param);
          if (customOperator.params) {
            params = customOperator.params;
          }
        } catch (error) {
          this.throwBadRequestException(
            `Invalid custom operator '${field}' query`,
          );
        }
        break;
    }

    return { str, params };
  }

  protected checkFilterIsArray(cond: QueryFilter, withLength?: boolean) {
    /* istanbul ignore if */
    if (
      !Array.isArray(cond.value) ||
      !cond.value.length ||
      (!isNil(withLength) ? withLength : false)
    ) {
      this.throwBadRequestException(`Invalid column '${cond.field}' value`);
    }
  }

  protected checkSqlInjection(field: string): string {
    /* istanbul ignore else */
    if (this.sqlInjectionRegEx.length) {
      for (let i = 0; i < this.sqlInjectionRegEx.length; i++) {
        /* istanbul ignore else */
        if (this.sqlInjectionRegEx[i].test(field)) {
          this.throwBadRequestException(`SQL injection detected: "${field}"`);
        }
      }
    }

    return field;
  }

  protected getColumnType(field: string): ColumnType {
    const column = this.repo.metadata.ownColumns.find(
      (col) => col.propertyName === field,
    );
    return column.type;
  }
}
