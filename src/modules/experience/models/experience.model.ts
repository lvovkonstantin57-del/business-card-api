import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { LocalDate } from '../../../common/scalars/local-date.scalar';

@ObjectType({ description: 'Employment period, computed from start/end dates' })
export class Period {
  @Field(() => LocalDate)
  start: Date;

  @Field(() => LocalDate, { nullable: true, description: 'null for the current position' })
  end: Date | null;

  @Field()
  isCurrent: boolean;

  @Field(() => Int, { description: 'Calendar months, both ends inclusive (CV convention)' })
  durationMonths: number;
}

@ObjectType()
export class Experience {
  @Field(() => ID)
  id: number;

  @Field()
  company: string;

  @Field()
  position: string;

  @Field(() => String, { nullable: true })
  location: string | null;

  @Field(() => [String])
  achievements: string[];

  // `period` is a computed field, see ExperienceResolver.
  startDate: Date;
  endDate: Date | null;
}
