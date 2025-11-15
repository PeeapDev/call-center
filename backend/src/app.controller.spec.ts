import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AsteriskService } from './asterisk/asterisk.service';

describe('AppController', () => {
  let appController: AppController;

  const mockAsteriskService = {
    isConnected: jest.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: AsteriskService,
          useValue: mockAsteriskService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API running message', () => {
      expect(appController.getHello()).toBe('Ministry of Education Call Center API is running');
    });
  });
});
