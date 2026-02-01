import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MusicModule } from './music/music.module';
import { YStorageModule } from './y-storage/y-storage.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

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
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    PrismaModule,
    MusicModule,
    YStorageModule,
  ],
})
export class AppModule {}
