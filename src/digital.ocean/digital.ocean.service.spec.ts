import { Test, TestingModule } from '@nestjs/testing';
import { DigitalOceanService } from './digital.ocean.service';

describe('DigitalOceanService', () => {
  let service: DigitalOceanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DigitalOceanService],
    }).compile();

    service = module.get<DigitalOceanService>(DigitalOceanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
