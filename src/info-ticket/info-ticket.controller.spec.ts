import { Test, TestingModule } from '@nestjs/testing';
import { InfoTicketController } from './info-ticket.controller';

describe('InfoTicketController', () => {
  let controller: InfoTicketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfoTicketController],
    }).compile();

    controller = module.get<InfoTicketController>(InfoTicketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
