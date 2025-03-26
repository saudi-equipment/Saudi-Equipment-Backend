import { Test, TestingModule } from '@nestjs/testing';
import { MoyasarService } from './moyasar.service';

describe('MoyasarService', () => {
  let service: MoyasarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoyasarService],
    }).compile();

    service = module.get<MoyasarService>(MoyasarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
