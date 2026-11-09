import { Field, ID, ObjectType } from '@nestjs/graphql';

/**
 * Only scalar fields live here. Relations (links, skills, experience, projects)
 * are exposed by ProfileResolver via @ResolveField, so they are loaded lazily
 * (only when requested) and in batches (DataLoader).
 */
@ObjectType({ description: 'Business card owner' })
export class Profile {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Stable human-readable identifier' })
  slug: string;

  @Field()
  name: string;

  @Field({ description: 'Short professional title' })
  headline: string;

  @Field({ description: 'Brief "about me"' })
  description: string;

  @Field(() => String, { nullable: true })
  location: string | null;

  @Field(() => String, { nullable: true })
  email: string | null;
}
