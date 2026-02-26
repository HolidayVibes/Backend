import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MusicModule } from './music/music.module';
import { YStorageModule } from './y-storage/y-storage.module';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailModule } from './mail/mail.module';

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
    AuthModule,
    UserModule,
    MailModule,
  ],
})
export class AppModule {}
