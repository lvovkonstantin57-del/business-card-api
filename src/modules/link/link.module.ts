import { Module } from '@nestjs/common';
import { LinkRepository } from './link.repository';

@Module({
  providers: [LinkRepository],
  exports: [LinkRepository],
})
export class LinkModule {}
