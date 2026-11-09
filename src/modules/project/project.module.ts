import { Module } from '@nestjs/common';
import { ProjectRepository } from './project.repository';

@Module({
  providers: [ProjectRepository],
  exports: [ProjectRepository],
})
export class ProjectModule {}
