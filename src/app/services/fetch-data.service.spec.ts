/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FetchDataService } from './fetch-data.service';

describe('Service: FetchData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FetchDataService]
    });
  });

  it('should ...', inject([FetchDataService], (service: FetchDataService) => {
    expect(service).toBeTruthy();
  }));
});
