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
    name: 'Константин Львов',
    headline: 'Fullstack-разработчик, UI/UX-дизайнер',
    description:
      'Fullstack-разработчик и UI/UX-дизайнер. Делаю веб-приложения, ботов и интеграции ' +
      'с внешними сервисами и сам разворачиваю их на своих серверах.',
    links: [
      {
        kind: LinkKind.GITHUB,
        label: 'GitHub',
        url: 'https://github.com/lvovkonstantin57-del',
      },
      { kind: LinkKind.TELEGRAM, label: 'Telegram', url: 'https://t.me/l1ttleStich' },
    ],
    skills: [
      { name: 'Python', category: SkillCategory.LANGUAGE },
      { name: 'JavaScript', category: SkillCategory.LANGUAGE },
      { name: 'TypeScript', category: SkillCategory.LANGUAGE },
      { name: 'HTML/CSS', category: SkillCategory.FRONTEND },
      { name: 'UI/UX-дизайн', category: SkillCategory.DESIGN },
      { name: 'Node.js', category: SkillCategory.BACKEND },
      { name: 'NestJS', category: SkillCategory.BACKEND },
      { name: 'GraphQL', category: SkillCategory.BACKEND },
      { name: 'Интеграция с внешними системами (REST API)', category: SkillCategory.BACKEND },
      { name: 'Google Calendar API', category: SkillCategory.BACKEND },
      { name: 'MAX Bot API', category: SkillCategory.BACKEND },
      { name: 'PostgreSQL', category: SkillCategory.DATABASE },
      { name: 'Prisma', category: SkillCategory.DATABASE },
      { name: 'Linux (Ubuntu)', category: SkillCategory.DEVOPS },
      { name: 'Docker', category: SkillCategory.DEVOPS },
      { name: 'Развёртывание на VDS (Selectel)', category: SkillCategory.DEVOPS },
      { name: 'Настройка домена и DNS (REG.RU)', category: SkillCategory.DEVOPS },
      { name: 'Git / GitLab', category: SkillCategory.TOOLING },
      { name: 'Home Assistant', category: SkillCategory.OTHER },
      // TODO: add the level, e.g. "Английский язык (B2)"
      { name: 'Английский язык', category: SkillCategory.OTHER },
      { name: 'Клиентский сервис', category: SkillCategory.OTHER },
    ],
    experience: [
      {
        company: 'Фриланс',
        position: 'Python-разработчик',
        location: 'Удалённо',
        startDate: '2026-01-01',
        achievements: [
          'По заказу стоматологической клиники «ДЕНТА» разработал бота в MAX: напоминает ' +
            'пациентам о записи и позволяет подтвердить или отменить визит; бот работает в клинике',
          'Интегрировал бота с медицинской программой «Феникс»: ответы пациентов передаются ' +
            'в систему клиники автоматически',
          'По заказу института разработал веб-приложение mpgu-timetable.ru с расписанием занятий, ' +
            'данные берутся из Google Calendar API',
          'Самостоятельно развернул приложение на Ubuntu VDS (Selectel), настроил домен и DNS (REG.RU)',
        ],
      },
    ],
    projects: [
      {
        name: 'mpgu-timetable.ru',
        description:
          'Веб-приложение с расписанием занятий для учебной группы; данные берутся из Google Calendar.',
        url: 'https://mpgu-timetable.ru',
        // TODO: repositoryUrl, web framework
        technologies: ['Python', 'Google Calendar API', 'Ubuntu VDS (Selectel)'],
      },
      {
        name: 'Бот для стоматологии «ДЕНТА» в MAX',
        description:
          'Напоминает пациентам о записи, позволяет подтвердить или отменить визит ' +
          'и передаёт ответ в программу «Феникс».',
        technologies: ['Python', 'MAX Bot API', 'Интеграция с «Феникс»'],
      },
      {
        name: 'Умный дом на Home Assistant',
        description:
          'Home Assistant в Docker на собственном сервере, интеграция с Яндекс Станцией, ' +
          'голосовое управление Spotify на Mac.',
        technologies: ['Docker', 'Home Assistant', 'Python'],
      },
      {
        name: 'Медицинский AI-хакатон (октябрь 2026)',
        description: 'Работающий прототип с пользовательским интерфейсом и защита перед жюри.',
        technologies: [],
      },
      {
        name: 'Business Card API',
        description:
          'Цифровая визитка: GraphQL API на NestJS + Prisma + PostgreSQL, упакованное в Docker.',
        repositoryUrl: 'https://github.com/lvovkonstantin57-del/business-card-api',
        technologies: ['TypeScript', 'NestJS', 'GraphQL', 'Prisma', 'PostgreSQL', 'Docker'],
      },
    ],
  },
];
