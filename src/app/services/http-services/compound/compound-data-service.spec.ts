/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CompoundDataService } from './compound-data.service';

describe('Service: CompoundDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompoundDataService]
    });
  });

  it('should ...', inject([CompoundDataService], (service: CompoundDataService) => {
    expect(service).toBeTruthy();
  }));
});
