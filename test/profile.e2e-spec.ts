import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Runs against a real, migrated and seeded PostgreSQL (DATABASE_URL).
 *   docker compose up -d db && npm run db:deploy && npm run db:seed && npm run test:e2e
 */
describe('GraphQL profile (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let queryCount = 0;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    // Count real SQL statements issued by Prisma.
    prisma.$on('query', () => {
      queryCount++;
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const gql = (query: string, variables?: Record<string, unknown>) =>
    request(app.getHttpServer()).post('/graphql').send({ query, variables });

  it('returns the profile with nested data from the task example', async () => {
    const res = await gql(`
      query {
        profile {
          name
          description
          skills { name }
          experience { company position period { start isCurrent durationMonths } }
          projects { name }
        }
      }
    `);

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    const { profile } = res.body.data;
    expect(profile.name).toEqual(expect.any(String));
    expect(profile.skills.length).toBeGreaterThan(0);
    expect(profile.experience.length).toBeGreaterThan(0);
    expect(profile.experience[0].period.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(profile.projects.length).toBeGreaterThan(0);
  });

  it('loads nested collections with a constant number of queries (no N+1)', async () => {
    queryCount = 0;
    const res = await gql(`
      query {
        profiles { links { url } skills { name } experience { company } projects { name } }
      }
    `);

    expect(res.body.errors).toBeUndefined();
    // 1 for profiles + 1 per relation, regardless of how many profiles exist.
    expect(queryCount).toBe(5);
  });

  it('returns NOT_FOUND-style error for an unknown slug', async () => {
    const res = await gql(`query ($slug: String) { profile(slug: $slug) { name } }`, {
      slug: 'does-not-exist',
    });

    expect(res.body.data).toBeNull();
    expect(res.body.errors[0].message).toContain('does-not-exist');
  });
});
