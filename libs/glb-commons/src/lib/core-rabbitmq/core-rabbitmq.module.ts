import { DynamicModule, Module } from "@nestjs/common";
import { Channel } from "amqp-connection-manager";
import { RabbitMQService } from "./service/core-rabbitmq.service";

@Module({})
export class GlbCoreRabbitmqModule {
  static forRoot(options: GlbCoreRabbitmqModuleOptions): DynamicModule {
    return {
      module: GlbCoreRabbitmqModule,
      providers: [
        {
          provide: 'GlbCoreRabbitmqModuleOptions',
          useValue: options,
        },
        RabbitMQService,
      ],
      exports: [RabbitMQService],
    };
  }
}

export interface GlbCoreRabbitmqModuleOptions {
  urls: string[];
  channelInitFunction: (channel: Channel) => Promise<void>;
}