import { Test, TestingModule } from '@nestjs/testing';
import { EventHandlerController } from './event-handler.controller';

describe('EventHandlerController', () => {
  let controller: EventHandlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventHandlerController],
    }).compile();

    controller = module.get<EventHandlerController>(EventHandlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
