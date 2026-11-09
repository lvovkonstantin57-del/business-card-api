import { NotFoundException } from '@nestjs/common';
import type { Profile } from '@prisma/client';
import type { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';

const owner = { id: 1, slug: 'me', name: 'Owner' } as Profile;

function createService(overrides: Partial<ProfileRepository> = {}) {
  const repository = {
    findBySlug: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(owner),
    findAll: jest.fn().mockResolvedValue([owner]),
    ...overrides,
  } as unknown as jest.Mocked<ProfileRepository>;
  return { service: new ProfileService(repository), repository };
}

describe('ProfileService.getProfile', () => {
  it('returns the card owner when no slug is given', async () => {
    const { service, repository } = createService();

    await expect(service.getProfile()).resolves.toBe(owner);
    expect(repository.findBySlug).not.toHaveBeenCalled();
  });

  it('looks the profile up by slug when given', async () => {
    const { service, repository } = createService({
      findBySlug: jest.fn().mockResolvedValue(owner),
    });

    await expect(service.getProfile('me')).resolves.toBe(owner);
    expect(repository.findBySlug).toHaveBeenCalledWith('me');
  });

  it('throws NotFoundException for an unknown slug', async () => {
    const { service } = createService();

    await expect(service.getProfile('nobody')).rejects.toBeInstanceOf(NotFoundException);
  });
});
