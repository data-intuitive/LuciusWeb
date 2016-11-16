/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ZhangDataService } from './zhang-data.service';

describe('Service: ZhangData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ZhangDataService]
    });
  });

  it('should ...', inject([ZhangDataService], (service: ZhangDataService) => {
    expect(service).toBeTruthy();
  }));
});
