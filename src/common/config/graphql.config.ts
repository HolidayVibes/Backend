import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { isDev } from '../utils/is_dev.util';

export async function getGraphQlConfig(
  configService,
): Promise<ApolloDriverConfig> {
  return {
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    sortSchema: true,
    context: ({ req, res }) => ({ req, res }),
    playground: isDev(configService),
  };
}
