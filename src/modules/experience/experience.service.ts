import { Injectable } from '@nestjs/common';
import { Period } from './models/experience.model';

/** Business rules around work experience. Pure logic, no I/O. */
@Injectable()
export class ExperienceService {
  /**
   * @param now injectable "today" so the rule is deterministic in tests
   */
  getPeriod(item: { startDate: Date; endDate: Date | null }, now: Date = new Date()): Period {
    const effectiveEnd = item.endDate ?? now;
    return {
      start: item.startDate,
      end: item.endDate,
      isCurrent: item.endDate === null,
      durationMonths: monthsInclusive(item.startDate, effectiveEnd),
    };
  }
}

/** Jun 2021 .. Feb 2023 => 21 months. Never negative. */
function monthsInclusive(from: Date, to: Date): number {
  const months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth()) +
    1;
  return Math.max(months, 0);
}
