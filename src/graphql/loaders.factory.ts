import { Injectable } from '@nestjs/common';
import type { Experience, Link, Project, Skill } from '@prisma/client';
import type DataLoader from 'dataloader';
import { createOneToManyLoader } from '../common/dataloader/one-to-many.loader';
import { ExperienceRepository } from '../modules/experience/experience.repository';
import { LinkRepository } from '../modules/link/link.repository';
import { ProjectRepository } from '../modules/project/project.repository';
import { SkillRepository } from '../modules/skill/skill.repository';

export interface Loaders {
  linksByProfileId: DataLoader<number, Link[]>;
  skillsByProfileId: DataLoader<number, Skill[]>;
  experienceByProfileId: DataLoader<number, Experience[]>;
  projectsByProfileId: DataLoader<number, Project[]>;
}

/**
 * Creates a fresh set of DataLoaders for every GraphQL request.
 *
 * Per-request instances are essential: DataLoader caches results, and sharing it between
 * requests would leak stale data and memory. Building them in the context factory (instead
 * of making providers REQUEST-scoped) keeps the rest of the DI graph singleton.
 */
@Injectable()
export class LoadersFactory {
  constructor(
    private readonly links: LinkRepository,
    private readonly skills: SkillRepository,
    private readonly experience: ExperienceRepository,
    private readonly projects: ProjectRepository,
  ) {}

  create(): Loaders {
    return {
      linksByProfileId: createOneToManyLoader(
        (ids) => this.links.findByProfileIds(ids),
        (link) => link.profileId,
      ),
      skillsByProfileId: createOneToManyLoader(
        (ids) => this.skills.findByProfileIds(ids),
        (skill) => skill.profileId,
      ),
      experienceByProfileId: createOneToManyLoader(
        (ids) => this.experience.findByProfileIds(ids),
        (item) => item.profileId,
      ),
      projectsByProfileId: createOneToManyLoader(
        (ids) => this.projects.findByProfileIds(ids),
        (project) => project.profileId,
      ),
    };
  }
}
