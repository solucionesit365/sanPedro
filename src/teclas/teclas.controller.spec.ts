import { Test, TestingModule } from '@nestjs/testing';
import { TeclasController } from './teclas.controller';

describe('TeclasController', () => {
  let controller: TeclasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeclasController],
    }).compile();

    controller = module.get<TeclasController>(TeclasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
