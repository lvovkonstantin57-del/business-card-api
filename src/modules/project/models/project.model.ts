import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Project {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true, description: 'Live demo / product page' })
  url: string | null;

  @Field(() => String, { nullable: true, description: 'Source code repository' })
  repositoryUrl: string | null;

  @Field(() => [String])
  technologies: string[];
}
