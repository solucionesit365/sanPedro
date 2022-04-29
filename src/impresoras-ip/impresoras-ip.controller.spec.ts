import { Test, TestingModule } from '@nestjs/testing';
import { ImpresorasIpController } from './impresoras-ip.controller';

describe('ImpresorasIpController', () => {
  let controller: ImpresorasIpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImpresorasIpController],
    }).compile();

    controller = module.get<ImpresorasIpController>(ImpresorasIpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
