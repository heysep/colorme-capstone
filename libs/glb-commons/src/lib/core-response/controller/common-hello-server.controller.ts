import { Controller, Get } from '@nestjs/common';
import { CommonHelloServerService } from '../service/common-hello-server.service';
import { CommonResponseUtil } from '../utils/common-response.util';
import { IApiCommonResponse } from '../dto/api-common-response.dto';

@Controller('hello')
export class CommonHelloServerController {
  constructor(
    private readonly commonHelloServerService: CommonHelloServerService,
  ) {}

  @Get()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getServerInfo(): Promise<IApiCommonResponse<any>> {
    return CommonResponseUtil.successResponse(
      await this.commonHelloServerService.helloServer(),
      '서버 정보를 조회하였습니다.',
    );
  }

  // @Get('debug/sleep/:sec')
  // async debugSleep(
  //   @Param('sec') sec: number,
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // ): Promise<IApiCommonResponse<any>> {
  //   const ms = Math.min(Math.max(sec, 0), 600) * 1000; // 0~600초 제한
  //   await new Promise((res) => setTimeout(res, ms));
  //   return CommonResponseUtil.successResponse(
  //     { slept: sec },
  //     '서버 정보를 조회하였습니다.',
  //   );
  // }
}
