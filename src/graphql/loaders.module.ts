import { Module } from '@nestjs/common';
import { ExperienceModule } from '../modules/experience/experience.module';
import { LinkModule } from '../modules/link/link.module';
import { ProjectModule } from '../modules/project/project.module';
import { SkillModule } from '../modules/skill/skill.module';
import { LoadersFactory } from './loaders.factory';

@Module({
  imports: [LinkModule, SkillModule, ExperienceModule, ProjectModule],
  providers: [LoadersFactory],
  exports: [LoadersFactory],
})
export class LoadersModule {}
