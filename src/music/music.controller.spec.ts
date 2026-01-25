/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { NotFoundException } from '@nestjs/common';
import { Music } from '@prisma/client';

// Моковые данные
const mockMusic: Music = {
  id: '1',
  title: 'Test Song',
  author: 'Test Artist',
  album: 'Test Album',
  genre: 'ROCK',
  duration: 180,
  releaseDate: 2023,
  createdAt: new Date(),
  updatedAt: new Date(),
  description: 'dwdqw',
  linkToYm: 'https://music.yandex.ru/album/9046986/track/609676',
};

// Мок для MusicService
const mockMusicService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('MusicController', () => {
  let controller: MusicController;
  let service: MusicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicController],
      providers: [
        {
          provide: MusicService,
          useValue: mockMusicService,
        },
      ],
    }).compile();

    controller = module.get<MusicController>(MusicController);
    service = module.get<MusicService>(MusicService);

    // Сброс всех моков перед каждым тестом
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new music record', async () => {
      const createDto: CreateMusicDto = {
        title: 'Test Song',
        author: 'Test Artist',
        album: 'Test Album',
        genre: 'ROCK',
        duration: 180,
        releaseDate: 2023,
        description: 'dasdasda',
        linkToYm: 'https://music.yandex.ru/album/9046986/track/609676',
      };

      mockMusicService.create.mockResolvedValue(mockMusic);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockMusic);
    });
  });

  describe('findAll', () => {
    it('should return an array of music records', async () => {
      mockMusicService.findAll.mockResolvedValue([mockMusic]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockMusic]);
    });

    it('should return empty array if no music found', async () => {
      mockMusicService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single music record by id', async () => {
      const id = '1';
      mockMusicService.findOne.mockResolvedValue(mockMusic);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockMusic);
    });

    it('should throw NotFoundException if music not found', async () => {
      const id = '999';
      mockMusicService.findOne.mockRejectedValue(
        new NotFoundException('Music not found'),
      );

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a music record', async () => {
      const id = '1';
      const updateDto: UpdateMusicDto = { title: 'Updated Title' };
      const updatedMusic = { ...mockMusic, ...updateDto };

      mockMusicService.update.mockResolvedValue(updatedMusic);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when updating non-existent record', async () => {
      const id = '999';
      const updateDto: UpdateMusicDto = { title: 'New Title' };

      mockMusicService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a music record', async () => {
      const id = '1';
      mockMusicService.remove.mockResolvedValue(mockMusic);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockMusic);
    });

    it('should throw NotFoundException when deleting non-existent record', async () => {
      const id = '999';
      mockMusicService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
