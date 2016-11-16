/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TargetHistogramDataService } from './target-histogram-data.service';

describe('Service: TargetHistogram', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TargetHistogramDataService]
    });
  });

  it('should ...', inject([TargetHistogramDataService], (service: TargetHistogramDataService) => {
    expect(service).toBeTruthy();
  }));
});
