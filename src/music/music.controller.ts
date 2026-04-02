import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { MusicService } from './music.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileTypeFromBuffer } from 'file-type';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() createMusicDto: CreateMusicDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file?.buffer) {
      const type = await fileTypeFromBuffer(file.buffer);

      if (!type || type.mime !== 'image/png') {
        throw new BadRequestException('Разрешены только PNG файлы');
      }
    }

    return this.musicService.create(createMusicDto, file);
  }

  @Get()
  findAll(@Query('page') page: number, @Query('per_page') per_page: number) {
    return this.musicService.findAll({ page, per_page });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.musicService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMusicDto: UpdateMusicDto) {
    return this.musicService.update(id, updateMusicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musicService.remove(id);
  }
}
