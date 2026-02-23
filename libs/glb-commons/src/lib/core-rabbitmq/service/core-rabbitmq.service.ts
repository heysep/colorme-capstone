// src/rabbitmq/rabbitmq.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import {
  AmqpConnectionManager,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';
import { Channel, Options, Replies } from 'amqplib';
import { GlbCoreRabbitmqModuleOptions } from '../core-rabbitmq.module';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);

  private connection: AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(
    @Inject('GlbCoreRabbitmqModuleOptions') private readonly options: GlbCoreRabbitmqModuleOptions,
  ) {}

  /**
   * NestJS 모듈 초기화 시점에 호출됩니다.
   * - RabbitMQ에 연결을 생성하고,
   * - 채널 래퍼(ChannelWrapper)를 만들고,
   * - 채널 이벤트 리스너를 붙입니다.
   */
  async onModuleInit() {
    await this.initConnection();
  }

  /**
   * 애플리케이션 종료 시점에 호출됩니다.
   * - 열린 채널과 연결을 닫습니다.
   */
  async onModuleDestroy() {
    try {
      if (this.channelWrapper) {
        await this.channelWrapper.close();
        this.logger.log('RabbitMQ 채널 래퍼를 정상적으로 종료했습니다.');
      }
      if (this.connection) {
        await this.connection.close();
        this.logger.log('RabbitMQ 연결을 정상적으로 종료했습니다.');
      }
    } catch (err) {
      this.logger.error('RabbitMQ 종료 중 에러 발생', err);
    }
  }

  /**
   * amqp-connection-manager로 RabbitMQ 연결 및 채널을 초기화합니다.
   */
  private async initConnection(): Promise<void> {
    const urls = this.options.urls;

    // amqp-connection-manager의 connect 함수에 URL 배열을 넘기면 자동으로 순회하며 재연결 시도
    this.connection = connect(urls);

    // 연결 상태 이벤트 리스너 추가 (옵션)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.connection.on('connect', (conn) => {
      this.logger.log(
        `RabbitMQ에 연결됨: ${this.maskUrls(
          urls,
        )}`,
      );
    });
    this.connection.on('disconnect', (params) => {
      this.logger.error(
        `RabbitMQ 연결이 끊어졌습니다: ${JSON.stringify(params.err)}`,
      );
    });

    // 채널 래퍼 생성: 단일 채널을 풀(pool)처럼 관리
    this.channelWrapper = this.connection.createChannel({
      json: false, // JSON 자동 변환 사용 안 함 (직접 Buffer로 변환)
      setup: async (channel: Channel) => {
        // 프로듀서 전용 채널 셋업: 여기에 필요한 큐나 교환기를 미리 선언(assert)할 수 있음
        await this.options.channelInitFunction(channel);

        this.logger.log('RabbitMQ 채널 초기화 완료');
      },
    });

    // 채널 에러 핸들링 (옵션)
    this.channelWrapper.on('error', (err) => {
      this.logger.error('RabbitMQ 채널 래퍼 오류 발생', err);
    });
    this.channelWrapper.on('close', () => {
      this.logger.log('RabbitMQ 채널 래퍼가 닫혔습니다.');
    });
  }

  /**
   * URI 문자열에 포함된 비밀번호를 마스킹하여 로그에 남기기 위한 헬퍼 메소드
   */
  private maskUrls(urls: string[]): string {
    return urls
      .map((uri) => {
        try {
          const urlObj = new URL(uri);
          if (urlObj.password) {
            urlObj.password = '****';
          }
          return urlObj.toString();
        } catch {
          return uri;
        }
      })
      .join(', ');
  }

  /**
   * 큐(Queue)에 단순히 메시지를 보내고 싶을 때 사용합니다.
   *
   * @param queueName - 메시지를 보낼 큐 이름
   * @param message - 보낼 데이터 (Buffer 또는 string)
   * @param options - 메시지 옵션 (예: persistent, contentType 등)
   */
  async sendToQueue(
    queueName: string,
    message: Buffer | string,
    options?: Options.Publish,
  ): Promise<Replies.Empty> {
    if (!this.channelWrapper) {
      throw new Error('RabbitMQ 채널이 아직 생성되지 않았습니다.');
    }

    const buffer = typeof message === 'string' ? Buffer.from(message) : message;

    return this.channelWrapper.sendToQueue(queueName, buffer, {
      persistent: true,
      ...options,
    });
  }

  /**
   * Exchange + RoutingKey를 이용해 메시지를 퍼블리시할 때 사용합니다.
   *
   * @param exchangeName - 교환기(Exchange) 이름
   * @param routingKey - 라우팅 키
   * @param message - 보낼 데이터 (Buffer 또는 string)
   * @param options - 메시지 옵션 (exchangeType과 exchangeOptions은 채널 설정용)
   */
  async publishToExchange(
    exchangeName: string,
    routingKey: string,
    message: Buffer | string,
    options?: {
      exchangeType?: string;
      exchangeOptions?: Options.AssertExchange;
      publishOptions?: Options.Publish;
    },
  ): Promise<void> {
    if (!this.channelWrapper) {
      throw new Error('RabbitMQ 채널이 아직 생성되지 않았습니다.');
    }

    const exchangeType = options?.exchangeType || 'direct';
    const exchangeOptions = options?.exchangeOptions || { durable: true };
    const publishOptions = options?.publishOptions || { persistent: true };

    // 교환기(assertExchange)를 채널 래퍼를 통해 수행하려면
    await this.channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertExchange(exchangeName, exchangeType, exchangeOptions);
    });

    const buffer = typeof message === 'string' ? Buffer.from(message) : message;
    // sendToExchange 메서드를 직접 채널에 호출
    await this.channelWrapper.publish(
      exchangeName,
      routingKey,
      buffer,
      publishOptions,
    );
  }
}