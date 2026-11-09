import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env';
import { GraphQLApiModule } from './graphql/graphql.config';
import { HealthController } from './health/health.controller';
import { ExperienceModule } from './modules/experience/experience.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    GraphQLApiModule,
    ProfileModule,
    ExperienceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
