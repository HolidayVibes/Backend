import { Module } from '@nestjs/common';
import { YStorageService } from './y-storage.service';
@Module({
  providers: [YStorageService],
  exports: [YStorageService],
})
export class YStorageModule {}
