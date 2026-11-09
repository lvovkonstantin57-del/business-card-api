import { ExperienceService } from './experience.service';

const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe('ExperienceService.getPeriod', () => {
  const service = new ExperienceService();

  it('counts calendar months inclusively for a finished position', () => {
    const period = service.getPeriod({ startDate: d('2021-06-01'), endDate: d('2023-02-28') });

    expect(period).toEqual({
      start: d('2021-06-01'),
      end: d('2023-02-28'),
      isCurrent: false,
      durationMonths: 21,
    });
  });

  it('uses "now" as the end of the current position', () => {
    const period = service.getPeriod(
      { startDate: d('2023-03-01'), endDate: null },
      d('2026-11-09'),
    );

    expect(period.isCurrent).toBe(true);
    expect(period.end).toBeNull();
    expect(period.durationMonths).toBe(45);
  });

  it('counts a single-month position as one month', () => {
    const period = service.getPeriod({ startDate: d('2024-01-10'), endDate: d('2024-01-25') });

    expect(period.durationMonths).toBe(1);
  });

  it('never returns a negative duration for inconsistent data', () => {
    const period = service.getPeriod({ startDate: d('2025-05-01'), endDate: d('2024-01-01') });

    expect(period.durationMonths).toBe(0);
  });
});
