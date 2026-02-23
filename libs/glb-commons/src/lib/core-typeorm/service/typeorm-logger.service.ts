/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from '@nestjs/common';
import { QueryRunner, SimpleConsoleLogger } from 'typeorm';

export class TypeOrmCustomLogger extends SimpleConsoleLogger {
  private static logger = new Logger(TypeOrmCustomLogger.name);

  override async logQuery(
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const isDev = process.env['IS_DEV']?.toLowerCase() === 'true';
    const log = `[QUERY] ${query} ${parameters}`;
    const finalLog = isDev
      ? log
      : log.length > 200
        ? `${log.slice(0, 200)}...`
        : log;
    TypeOrmCustomLogger.logger.verbose(finalLog);
    return;
  }

  override async logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): Promise<void> {
    TypeOrmCustomLogger.logger.error(
      `[QUERY ERROR] ${error} ${query} ${parameters}`,
    );
    return;
  }
  override async logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ): Promise<void> {
    TypeOrmCustomLogger.logger.warn(
      `[QUERY SLOW] ${time} ${query} ${parameters}`,
    );
    return;
  }
  override async logSchemaBuild(
    message: string,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    TypeOrmCustomLogger.logger.verbose(`[SCHEMA BUILD] ${message}`);
    return;
  }
  override async logMigration(
    message: string,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    TypeOrmCustomLogger.logger.verbose(`[MIGRATION] ${message}`);
    return;
  }

  override async log(
    level: 'log' | 'info' | 'warn',
    message: any,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    TypeOrmCustomLogger.logger.verbose(
      `[QUERY DEFAULT LOG] [${level}] ${message}`,
    );
    return;
  }
}
