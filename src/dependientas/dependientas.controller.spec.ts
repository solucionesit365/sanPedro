import { Test, TestingModule } from '@nestjs/testing';
import { DependientasController } from './dependientas.controller';

describe('DependientasController', () => {
  let controller: DependientasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DependientasController],
    }).compile();

    controller = module.get<DependientasController>(DependientasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
