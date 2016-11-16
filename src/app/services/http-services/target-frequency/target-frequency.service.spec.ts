/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TargetFrequencyService } from './target-frequency.service';

describe('Service: TargetFrequency', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TargetFrequencyService]
    });
  });

  it('should ...', inject([TargetFrequencyService], (service: TargetFrequencyService) => {
    expect(service).toBeTruthy();
  }));
});
