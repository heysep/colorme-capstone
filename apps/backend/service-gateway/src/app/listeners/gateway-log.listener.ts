import { LogMxProvider } from '@capstone-project/glb-commons';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

export interface GatewayLogEvent {
  message: string;
  metadata: {
    path: string;
    clientIp: string;
    type: 'proxy' | 'mapping';
  };
}

@Injectable()
export class GatewayLogEventListener {
  private readonly logger = new Logger(GatewayLogEventListener.name);

  constructor(private readonly logMxProvider: LogMxProvider) {
    this.logger.log('GatewayLogEventListener initialized');
  }

  @OnEvent('gateway.log')
  handleGatewayLogEvent(event: GatewayLogEvent) {
    // this.logger.debug(`Received gateway log event: ${JSON.stringify(event)}`);

    try {
      if (this.logMxProvider) {
        this.logMxProvider.logNoMetadata(event.message);
      } else {
        this.logger.error('LogMxProvider is not available');
      }
    } catch (error) {
      this.logger.error('Error in gateway log event handler:', error);
    }
  }
}
