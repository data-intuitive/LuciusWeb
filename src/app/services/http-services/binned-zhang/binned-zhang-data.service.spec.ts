/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BinnedZhangDataService } from './binned-zhang-data.service';
import { HttpModule } from '@angular/http';

describe('Service: ZhangData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [BinnedZhangDataService]
    });
  });

  it('should ...', inject([BinnedZhangDataService], (service: BinnedZhangDataService) => {
    expect(service).toBeTruthy();
  }));
});
