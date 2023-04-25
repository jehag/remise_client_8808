import { TestBed } from '@angular/core/testing';

import { VizService } from './viz.service';

describe('VizService', () => {
  let service: VizService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
