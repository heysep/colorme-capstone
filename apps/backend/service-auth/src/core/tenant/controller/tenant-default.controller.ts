import {
  ApiResponse,
  CommonResponseUtil,
  IJsxCrudGetOneDtoFactory,
  LogMxProvider,
  RnDefaultTenantEntity,
} from '@capstone-project/glb-commons';
import { Controller, Get, HttpStatus, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TenantDefaultService } from '../service/tenant-default.service';

@Controller({
  path: 'tenant/default',
  version: '1',
})
@ApiTags('Tenant Default - Default Controller')
export class TenantDefaultController {
  constructor(
    private readonly tenantDefaultService: TenantDefaultService,
    private readonly logger: LogMxProvider,
  ) {}

  @Get('code/:code')
  @ApiOperation({
    operationId: 'findTenantByCode',
    summary: '테넌트 조회',
  })
  @ApiParam({
    name: 'code',
    description: '테넌트 코드',
    required: true,
  })
  @ApiResponse(
    [
      {
        type: IJsxCrudGetOneDtoFactory(RnDefaultTenantEntity),
        exampleName: '[코드로 테넌트 조회] 테넌트 조회 성공',
        exclude: {
          configs: true,
        },
      },
    ],
    '테넌트 조회 성공',
  )
  async findTenantByCode(@Param('code') code: string, @Req() reqOrigin) {
    const result = await this.tenantDefaultService.findTenantByCode({
      code: code,
    });
    this.logger.log(
      '테넌트 조회 요청',
      this.logger.makeMetadata({
        request: reqOrigin,
        status: HttpStatus.OK,
        resultCode: 'OK_0000',
      }),
    );
    return CommonResponseUtil.successResponse(result.data, '테넌트 조회 성공');
  }

  @Get('domain/:domain')
  @ApiOperation({
    operationId: 'findTenantByDomain',
    summary: '테넌트 조회',
  })
  @ApiParam({
    name: 'domain',
    description: '테넌트 도메인',
    required: true,
  })
  @ApiResponse(
    [
      {
        type: IJsxCrudGetOneDtoFactory(RnDefaultTenantEntity),
        exampleName: '[도메인으로 테넌트 조회] 테넌트 조회 성공',
        exclude: {
          configs: true,
        },
      },
    ],
    '테넌트 조회 성공',
  )
  async findTenantByDomain(@Param('domain') domain: string, @Req() reqOrigin) {
    const result = await this.tenantDefaultService.findTenantByDomain({
      domain: domain,
    });
    this.logger.log(
      '테넌트 조회 요청',
      this.logger.makeMetadata({
        request: reqOrigin,
        status: HttpStatus.OK,
        resultCode: 'OK_0000',
      }),
    );
    return CommonResponseUtil.successResponse(result.data, '테넌트 조회 성공');
  }
}
