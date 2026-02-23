// module-ref.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ModuleRef, ContextIdFactory } from '@nestjs/core';
import { Observable } from 'rxjs';

declare module 'http' {
  interface IncomingMessage {
    __moduleRef?: ModuleRef;
    __contextId?: ReturnType<(typeof ContextIdFactory)['getByRequest']>;
  }
}

@Injectable()
export class ModuleRefInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const type = ctx.getType<'http' | 'rpc' | 'ws'>();
    if (type !== 'http') {
      return next.handle();
    }

    const req = ctx.switchToHttp().getRequest();
    req.__moduleRef = this.moduleRef;
    req.__contextId = ContextIdFactory.getByRequest(req);
    return next.handle();
  }
}
