import { Prisma, PrismaClient } from '@prisma/client';
import { ProfileSeed, profiles } from './data';

/**
 * Idempotent seed: safe to run on every application start.
 *
 * The profile is upserted by its natural key (`slug`); its child collections are replaced
 * as a whole. Everything happens in ONE nested write, which Prisma executes in a single
 * transaction, so a reader never observes a half-written profile. data.ts is the source of
 * truth for the card's content, therefore "replace" semantics are exactly what we want.
 */
function toChildren(data: ProfileSeed) {
  // The array index becomes `sortOrder`: the order in data.ts is the order in the API.
  return {
    links: data.links.map((link, sortOrder) => ({ ...link, sortOrder })),
    skills: data.skills.map((skill, sortOrder) => ({ ...skill, sortOrder })),
    experience: data.experience.map(({ startDate, endDate, ...rest }) => ({
      ...rest,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    })),
    projects: data.projects.map((project, sortOrder) => ({ ...project, sortOrder })),
  };
}

async function seedProfile(prisma: PrismaClient, data: ProfileSeed): Promise<void> {
  const { slug, name, headline, description, location, email } = data;
  const fields = { name, headline, description, location: location ?? null, email: email ?? null };
  const children = toChildren(data);

  const create: Prisma.ProfileCreateInput = {
    slug,
    ...fields,
    links: { createMany: { data: children.links } },
    skills: { createMany: { data: children.skills } },
    experience: { createMany: { data: children.experience } },
    projects: { createMany: { data: children.projects } },
  };

  const update: Prisma.ProfileUpdateInput = {
    ...fields,
    links: { deleteMany: {}, createMany: { data: children.links } },
    skills: { deleteMany: {}, createMany: { data: children.skills } },
    experience: { deleteMany: {}, createMany: { data: children.experience } },
    projects: { deleteMany: {}, createMany: { data: children.projects } },
  };

  await prisma.profile.upsert({ where: { slug }, create, update });
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    for (const profile of profiles) {
      await seedProfile(prisma, profile);
      console.log(`[seed] profile "${profile.slug}" is up to date`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('[seed] failed', error);
  process.exit(1);
});
