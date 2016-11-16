/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TargetFrequencyDataService } from './target-frequency-data.service';
import { HttpModule } from '@angular/http';

describe('Service: TargetFrequency', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TargetFrequencyDataService],
      imports: [
        HttpModule
      ],
    });
  });

  it('should ...', inject([TargetFrequencyDataService], (service: TargetFrequencyDataService) => {
    expect(service).toBeTruthy();
  }));
});
