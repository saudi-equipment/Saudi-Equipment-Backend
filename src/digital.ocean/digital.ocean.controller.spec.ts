import { Test, TestingModule } from '@nestjs/testing';
import { DigitalOceanController } from './digital.ocean.controller';

describe('DigitalOceanController', () => {
  let controller: DigitalOceanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DigitalOceanController],
    }).compile();

    controller = module.get<DigitalOceanController>(DigitalOceanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
