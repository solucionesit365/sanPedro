import { Test, TestingModule } from '@nestjs/testing';
import { OrdaticController } from './ordatic.controller';

describe('OrdaticController', () => {
  let controller: OrdaticController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdaticController],
    }).compile();

    controller = module.get<OrdaticController>(OrdaticController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
