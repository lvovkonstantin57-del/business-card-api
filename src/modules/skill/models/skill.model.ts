import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SkillCategory, SkillLevel } from '@prisma/client';

registerEnumType(SkillCategory, { name: 'SkillCategory' });
registerEnumType(SkillLevel, { name: 'SkillLevel' });

@ObjectType()
export class Skill {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field(() => SkillCategory)
  category: SkillCategory;

  @Field(() => SkillLevel, { nullable: true })
  level: SkillLevel | null;
}
