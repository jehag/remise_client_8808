import { TestBed } from '@angular/core/testing';

import { ScalesService } from './scales.service';

describe('ScalesService', () => {
  let service: ScalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
