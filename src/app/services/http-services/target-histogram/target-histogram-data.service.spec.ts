/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TargetHistogramDataService } from './target-histogram-data.service';
import { HttpModule } from '@angular/http';

describe('Service: TargetHistogram', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TargetHistogramDataService],
      imports: [
        HttpModule
      ],
    });
  });

  it('should ...', inject([TargetHistogramDataService], (service: TargetHistogramDataService) => {
    expect(service).toBeTruthy();
  }));
});
