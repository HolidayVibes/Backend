import { Module } from '@nestjs/common';
import { YStorageService } from './y-storage.service';
import { YStorageController } from './y-storage.controller';

@Module({
  controllers: [YStorageController],
  providers: [YStorageService],
})
export class YStorageModule {}
