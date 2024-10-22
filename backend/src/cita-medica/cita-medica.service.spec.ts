import { Test, TestingModule } from '@nestjs/testing';
import { CitaMedicaService } from './cita-medica.service';

describe('CitaMedicaService', () => {
  let service: CitaMedicaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CitaMedicaService],
    }).compile();

    service = module.get<CitaMedicaService>(CitaMedicaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
