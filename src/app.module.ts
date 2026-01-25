import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MusicModule } from './music/music.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // GraphQLModule.forRootAsync<ApolloDriverConfig>({
    //   imports: [ConfigModule],
    //   driver: ApolloDriver,
    //   useFactory: getGraphQlConfig,
    //   inject: [ConfigService],
    // }),
    PrismaModule,
    MusicModule,
  ],
})
export class AppModule {}
