import { Test, TestingModule } from '@nestjs/testing';
import { PromocionesController } from './promociones.controller';

describe('PromocionesController', () => {
  let controller: PromocionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromocionesController],
    }).compile();

    controller = module.get<PromocionesController>(PromocionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
