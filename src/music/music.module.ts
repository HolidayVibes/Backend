import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { YStorageModule } from 'src/y-storage/y-storage.module';

@Module({
  imports: [YStorageModule],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
