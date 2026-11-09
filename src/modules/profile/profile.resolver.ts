import { Args, Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import type { GraphQLContext } from '../../graphql/graphql-context';
import { Experience } from '../experience/models/experience.model';
import { Link } from '../link/models/link.model';
import { Project } from '../project/models/project.model';
import { Skill } from '../skill/models/skill.model';
import { Profile } from './models/profile.model';
import { ProfileService } from './profile.service';

/**
 * GraphQL transport layer only: maps the schema to the service / loaders.
 * No business rules and no Prisma calls here.
 */
@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, {
    description: 'Business card profile. Without `slug` returns the card owner.',
  })
  profile(
    @Args('slug', { type: () => String, nullable: true }) slug?: string | null,
  ): Promise<Profile> {
    return this.profileService.getProfile(slug);
  }

  @Query(() => [Profile], { description: 'All profiles stored in the database' })
  profiles(): Promise<Profile[]> {
    return this.profileService.listProfiles();
  }

  @ResolveField(() => [Link])
  links(@Parent() profile: Profile, @Context() ctx: GraphQLContext) {
    return ctx.loaders.linksByProfileId.load(profile.id);
  }

  @ResolveField(() => [Skill])
  skills(@Parent() profile: Profile, @Context() ctx: GraphQLContext) {
    return ctx.loaders.skillsByProfileId.load(profile.id);
  }

  @ResolveField(() => [Experience], { description: 'Most recent first' })
  experience(@Parent() profile: Profile, @Context() ctx: GraphQLContext) {
    return ctx.loaders.experienceByProfileId.load(profile.id);
  }

  @ResolveField(() => [Project])
  projects(@Parent() profile: Profile, @Context() ctx: GraphQLContext) {
    return ctx.loaders.projectsByProfileId.load(profile.id);
  }
}
