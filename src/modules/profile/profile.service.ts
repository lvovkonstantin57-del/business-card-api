import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profiles: ProfileRepository) {}

  /**
   * Without a slug returns the card owner (the first profile): the API is a personal
   * business card, so `query { profile { ... } }` must work without arguments.
   */
  async getProfile(slug?: string | null): Promise<Profile> {
    const profile = slug ? await this.profiles.findBySlug(slug) : await this.profiles.findFirst();

    if (!profile) {
      throw new NotFoundException(slug ? `Profile "${slug}" not found` : 'No profile found');
    }
    return profile;
  }

  listProfiles(): Promise<Profile[]> {
    return this.profiles.findAll();
  }
}
