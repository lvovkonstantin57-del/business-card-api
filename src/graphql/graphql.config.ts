import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';
import { GraphQLContext } from './graphql-context';
import { LoadersFactory } from './loaders.factory';
import { LoadersModule } from './loaders.module';

/** Opened in Apollo Sandbox by default, so a reviewer can press "Run" right away. */
const EXAMPLE_QUERY = `query BusinessCard {
  profile {
    name
    headline
    description
    links { kind label url }
    skills { name category level }
    experience {
      company
      position
      period { start end isCurrent durationMonths }
      achievements
    }
    projects { name description url repositoryUrl technologies }
  }
}
`;

export const GraphQLApiModule = GraphQLModule.forRootAsync<ApolloDriverConfig>({
  driver: ApolloDriver,
  imports: [LoadersModule],
  inject: [LoadersFactory],
  useFactory: (loaders: LoadersFactory): ApolloDriverConfig => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      // Code-first: TypeScript classes are the single source of truth for the schema.
      // Locally the SDL is written to schema.gql (committed, easy to review in PRs).
      autoSchemaFile: isProduction ? true : join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      // Sandbox replaces the deprecated GraphQL Playground. It is a public showcase API,
      // so introspection and the landing page stay enabled in production on purpose.
      playground: false,
      introspection: true,
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({
          embed: true,
          includeCookies: false,
          document: EXAMPLE_QUERY,
        }),
      ],
      context: (): GraphQLContext => ({ loaders: loaders.create() }),
    };
  },
});
