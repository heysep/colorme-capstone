/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CreateManyDto,
  CrudRequest,
  GetManyDefaultResponse,
} from '@dataui/crud';
import { ParsedRequestParams } from '@dataui/crud-request';
import { DeepPartial, ObjectLiteral } from 'typeorm';
import { runInTransaction } from 'typeorm-transactional';
import { CommonError } from '../../../core-response/utils/common-error.util';
import { GlbCoreTypeOrmError } from '../../error/tenant/tenant-error.error';
import { ITenantTransactionContext } from '../../utils/tenant-transaction-context.utils';
import {
  GroupByResponse,
  TypeOrmCrudService,
} from './tenant-typeorm-jsx-crud-origin.service';

export abstract class TenantTypeOrmJsxCrudService<
  T extends ObjectLiteral,
> extends TypeOrmCrudService<T> {
  async rnGetMany(
    ctx: ITenantTransactionContext,
    req: CrudRequest,
  ): Promise<GetManyDefaultResponse<T> | T[]> {
    try {
      return await super.getMany(req);
    } catch (error) {
      if (error instanceof CommonError) {
        throw error;
      }

      throw CommonError.createByErrorCode(
        GlbCoreTypeOrmError.JSX_CRUD_GET_MANY_UNK_ERROR,
        ` ${GlbCoreTypeOrmError.JSX_CRUD_GET_MANY_UNK_ERROR.message} --> ${error}`,
      );
    }
  }

  async rnGetManyGroupBy<E>(
    ctx: ITenantTransactionContext,
    req: CrudRequest & { parsed: ParsedRequestParams | any },
  ): Promise<GroupByResponse<E> | null> {
    try {
      return await super.getManyGroupBy<E>(req);
    } catch (error) {
      if (error instanceof CommonError) {
        throw error;
      }

      throw CommonError.createByErrorCode(
        GlbCoreTypeOrmError.JSX_CRUD_GET_MANY_UNK_ERROR,
        ` ${GlbCoreTypeOrmError.JSX_CRUD_GET_MANY_UNK_ERROR.message} --> ${error}`,
      );
    }
  }

  async rnGetOne(ctx: ITenantTransactionContext, req: CrudRequest): Promise<T> {
    try {
      return await super.getOne(req);
    } catch (error) {
      if (error instanceof CommonError) {
        throw error;
      }

      throw CommonError.createByErrorCode(
        GlbCoreTypeOrmError.JSX_CRUD_GET_ONE_UNK_ERROR,
        ` ${GlbCoreTypeOrmError.JSX_CRUD_GET_ONE_UNK_ERROR.message} --> ${error}`,
      );
    }
  }

  async rnCreateOne(
    ctx: ITenantTransactionContext,
    req: CrudRequest,
    dto: DeepPartial<T>,
  ): Promise<T> {
    return await runInTransaction(
      async () => {
        try {
          return await super.createOne(req, dto);
        } catch (error) {
          if (error instanceof CommonError) {
            throw error;
          }

          throw CommonError.createByErrorCode(
            GlbCoreTypeOrmError.JSX_CRUD_CREATE_ONE_UNK_ERROR,
            ` ${GlbCoreTypeOrmError.JSX_CRUD_CREATE_ONE_UNK_ERROR.message} --> ${error}`,
          );
        }
      },
      { connectionName: ctx.tenantCode },
    );
  }

  async rnCreateMany(
    ctx: ITenantTransactionContext,
    req: CrudRequest,
    dto: CreateManyDto<DeepPartial<T>>,
  ): Promise<T[]> {
    return await runInTransaction(
      async () => {
        try {
          return await super.createMany(req, dto);
        } catch (error) {
          if (error instanceof CommonError) {
            throw error;
          }

          throw CommonError.createByErrorCode(
            GlbCoreTypeOrmError.JSX_CRUD_CREATE_MANY_UNK_ERROR,
            ` ${GlbCoreTypeOrmError.JSX_CRUD_CREATE_MANY_UNK_ERROR.message} --> ${error}`,
          );
        }
      },
      { connectionName: ctx.tenantCode },
    );
  }

  async rnUpdateOne(
    ctx: ITenantTransactionContext,
    req: CrudRequest,
    dto: DeepPartial<T>,
  ): Promise<T> {
    return await runInTransaction(
      async () => {
        try {
          return await super.updateOne(req, dto);
        } catch (error) {
          if (error instanceof CommonError) {
            throw error;
          }

          throw CommonError.createByErrorCode(
            GlbCoreTypeOrmError.JSX_CRUD_UPDATE_ONE_UNK_ERROR,
            ` ${GlbCoreTypeOrmError.JSX_CRUD_UPDATE_ONE_UNK_ERROR.message} --> ${error}`,
          );
        }
      },
      { connectionName: ctx.tenantCode },
    );
  }

  // async rnUpdateMany(
  //   ctx: ITenantTransactionContext,
  //   req: CrudRequest,
  //   dto: UpdateManyDto<DeepPartial<T>>,
  // ): Promise<void> {
  //   await runInTransaction(
  //     async () => {
  //       try {
  //         await Promise.all(
  //           dto.bulk.map(async (item) => {
  //             const { id, ...updateData } = item;
  //             const updateReq: CrudRequest = {
  //               ...req,
  //               parsed: {
  //                 ...req.parsed,
  //                 paramsFilter: [
  //                   {
  //                     field: 'id',
  //                     operator: 'eq',
  //                     value: id,
  //                   },
  //                 ],
  //                 search: {
  //                   id,
  //                 },
  //               },
  //             };
  //             await super.updateOne(updateReq, updateData as any);
  //           }),
  //         );
  //       } catch (error) {
  //         if (error instanceof CommonError) {
  //           throw error;
  //         }

  //         throw CommonError.createByErrorCode(
  //           GlbCoreTypeOrmError.JSX_CRUD_UPDATE_MANY_UNK_ERROR,
  //           ` ${GlbCoreTypeOrmError.JSX_CRUD_UPDATE_MANY_UNK_ERROR.message} --> ${error}`,
  //         );
  //       }
  //     },
  //     { connectionName: ctx.tenantCode },
  //   );
  // }

  async rnRecoverOne(
    ctx: ITenantTransactionContext,
    req: CrudRequest,
  ): Promise<T> {
    return await runInTransaction(
      async () => {
        try {
          return await super.recoverOne(req);
        } catch (error) {
          if (error instanceof CommonError) {
            throw error;
          }

          throw CommonError.createByErrorCode(
            GlbCoreTypeOrmError.JSX_CRUD_RECOVER_ONE_UNK_ERROR,
            ` ${GlbCoreTypeOrmError.JSX_CRUD_RECOVER_ONE_UNK_ERROR.message} --> ${error}`,
          );
        }
      },
      { connectionName: ctx.tenantCode },
    );
  }

  async rnReplaceOne(
    ctx: ITenantTransactionContext,
    req: CrudRequest,
    dto: DeepPartial<T>,
  ): Promise<T> {
    return await runInTransaction(
      async () => {
        try {
          return await super.replaceOne(req, dto);
        } catch (error) {
          if (error instanceof CommonError) {
            throw error;
          }

          throw CommonError.createByErrorCode(
            GlbCoreTypeOrmError.JSX_CRUD_REPLACE_ONE_UNK_ERROR,
            ` ${GlbCoreTypeOrmError.JSX_CRUD_REPLACE_ONE_UNK_ERROR.message} --> ${error}`,
          );
        }
      },
      { connectionName: ctx.tenantCode },
    );
  }

  async rnDeleteOne(
    ctx: ITenantTransactionContext,
    req: CrudRequest,
  ): Promise<void | T> {
    return await runInTransaction(
      async () => {
        try {
          return await super.deleteOne(req);
        } catch (error) {
          if (error instanceof CommonError) {
            throw error;
          }

          throw CommonError.createByErrorCode(
            GlbCoreTypeOrmError.JSX_CRUD_DELETE_ONE_UNK_ERROR,
            ` ${GlbCoreTypeOrmError.JSX_CRUD_DELETE_ONE_UNK_ERROR.message} --> ${error}`,
          );
        }
      },
      { connectionName: ctx.tenantCode },
    );
  }
}
