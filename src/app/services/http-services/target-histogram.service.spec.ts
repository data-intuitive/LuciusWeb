/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TargetHistogramService } from './target-histogram.service';

describe('Service: TargetHistogram', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TargetHistogramService]
    });
  });

  it('should ...', inject([TargetHistogramService], (service: TargetHistogramService) => {
    expect(service).toBeTruthy();
  }));
});
