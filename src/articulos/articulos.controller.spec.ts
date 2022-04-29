import { Test, TestingModule } from '@nestjs/testing';
import { ArticulosController } from './articulos.controller';

describe('ArticulosController', () => {
  let controller: ArticulosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticulosController],
    }).compile();

    controller = module.get<ArticulosController>(ArticulosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
