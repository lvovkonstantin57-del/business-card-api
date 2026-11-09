import { LinkKind, SkillCategory, SkillLevel } from '@prisma/client';

/**
 * The content of the business card.
 *
 * This is the ONLY file you need to edit to change what the API returns:
 * the seed script is idempotent and re-applies it on every start.
 *
 * TODO: replace the placeholder values below with real data.
 */

export interface ProfileSeed {
  slug: string;
  name: string;
  headline: string;
  description: string;
  location?: string;
  email?: string;
  links: { kind: LinkKind; label: string; url: string }[];
  skills: { name: string; category: SkillCategory; level?: SkillLevel }[];
  experience: {
    company: string;
    position: string;
    location?: string;
    /** ISO date, YYYY-MM-DD */
    startDate: string;
    /** ISO date, YYYY-MM-DD; omit for the current position */
    endDate?: string;
    achievements: string[];
  }[];
  projects: {
    name: string;
    description?: string;
    url?: string;
    repositoryUrl?: string;
    technologies: string[];
  }[];
}

export const profiles: ProfileSeed[] = [
  {
    slug: 'me',
    name: 'Konstantin Lvov',
    headline: 'Backend Developer (Node.js / TypeScript)',
    description:
      'Backend developer focused on Node.js and TypeScript. I design APIs, ' +
      'model data and care about maintainable architecture, tests and predictable deployments.',
    location: 'TODO: City, Country',
    email: 'lvovkonstantin57@gmail.com',
    links: [
      { kind: LinkKind.GITHUB, label: 'GitHub', url: 'https://github.com/TODO' },
      { kind: LinkKind.LINKEDIN, label: 'LinkedIn', url: 'https://www.linkedin.com/in/TODO' },
      { kind: LinkKind.TELEGRAM, label: 'Telegram', url: 'https://t.me/TODO' },
      { kind: LinkKind.EMAIL, label: 'Email', url: 'mailto:lvovkonstantin57@gmail.com' },
    ],
    skills: [
      { name: 'TypeScript', category: SkillCategory.LANGUAGE, level: SkillLevel.ADVANCED },
      { name: 'JavaScript', category: SkillCategory.LANGUAGE, level: SkillLevel.ADVANCED },
      { name: 'Node.js', category: SkillCategory.BACKEND, level: SkillLevel.ADVANCED },
      { name: 'NestJS', category: SkillCategory.BACKEND, level: SkillLevel.ADVANCED },
      { name: 'GraphQL', category: SkillCategory.BACKEND, level: SkillLevel.INTERMEDIATE },
      { name: 'REST API design', category: SkillCategory.BACKEND, level: SkillLevel.ADVANCED },
      { name: 'PostgreSQL', category: SkillCategory.DATABASE, level: SkillLevel.ADVANCED },
      { name: 'Prisma', category: SkillCategory.DATABASE, level: SkillLevel.INTERMEDIATE },
      { name: 'Redis', category: SkillCategory.DATABASE, level: SkillLevel.INTERMEDIATE },
      { name: 'Docker', category: SkillCategory.DEVOPS, level: SkillLevel.INTERMEDIATE },
      {
        name: 'CI/CD (GitHub Actions)',
        category: SkillCategory.DEVOPS,
        level: SkillLevel.INTERMEDIATE,
      },
      { name: 'Git', category: SkillCategory.TOOLING, level: SkillLevel.ADVANCED },
      { name: 'Jest', category: SkillCategory.TOOLING, level: SkillLevel.INTERMEDIATE },
    ],
    experience: [
      {
        company: 'TODO: Current Company',
        position: 'Backend Developer',
        location: 'Remote',
        startDate: '2023-03-01',
        achievements: [
          'TODO: Designed and shipped a GraphQL API used by N clients',
          'TODO: Cut p95 latency of the main endpoint from X ms to Y ms',
          'TODO: Introduced integration tests and CI, reducing regressions',
        ],
      },
      {
        company: 'TODO: Previous Company',
        position: 'Junior Node.js Developer',
        startDate: '2021-06-01',
        endDate: '2023-02-28',
        achievements: [
          'TODO: Built internal REST services on Express/NestJS',
          'TODO: Migrated legacy data access to an ORM with typed queries',
        ],
      },
    ],
    projects: [
      {
        name: 'Business Card API',
        description: 'This service: NestJS + GraphQL + Prisma + PostgreSQL, packaged with Docker.',
        repositoryUrl: 'https://github.com/TODO/business-card-api',
        technologies: ['NestJS', 'GraphQL', 'Prisma', 'PostgreSQL', 'Docker'],
      },
      {
        name: 'TODO: Another project',
        description: 'TODO: one-line description',
        url: 'https://example.com',
        repositoryUrl: 'https://github.com/TODO/another-project',
        technologies: ['TypeScript', 'Node.js'],
      },
    ],
  },
];
