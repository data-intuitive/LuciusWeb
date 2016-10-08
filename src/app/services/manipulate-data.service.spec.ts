/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ManipulateDataService } from './manipulate-data.service';

describe('Service: GetData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManipulateDataService]
    });
  });

  it('should ...', inject([ManipulateDataService], (service: ManipulateDataService) => {
    expect(service).toBeTruthy();
  }));
});
