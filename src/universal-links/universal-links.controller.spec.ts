import { Test, TestingModule } from '@nestjs/testing';
import { UniversalLinksController } from './universal-links.controller';

describe('UniversalLinksController', () => {
  let controller: UniversalLinksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UniversalLinksController],
    }).compile();

    controller = module.get<UniversalLinksController>(UniversalLinksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
