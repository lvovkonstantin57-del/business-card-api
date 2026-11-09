import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ExperienceService } from './experience.service';
import { Experience, Period } from './models/experience.model';

@Resolver(() => Experience)
export class ExperienceResolver {
  constructor(private readonly experienceService: ExperienceService) {}

  @ResolveField(() => Period)
  period(@Parent() experience: Experience): Period {
    return this.experienceService.getPeriod(experience);
  }
}
