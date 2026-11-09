import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Query events are always emitted (cheap) so tests can count SQL statements;
    // they are printed only with LOG_SQL=true.
    super({ log: [{ emit: 'event', level: 'query' }] });
    if (process.env.LOG_SQL === 'true') {
      // Handy for demonstrating that DataLoader collapses N+1 into a fixed number of queries.
      this.$on('query', (e) => this.logger.debug(`${e.query} ${e.params} (${e.duration}ms)`));
    }
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
