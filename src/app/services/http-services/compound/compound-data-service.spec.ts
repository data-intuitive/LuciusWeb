/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CompoundDataService } from './compound-data.service';
import { HttpModule } from '@angular/http';

describe('Service: CompoundDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CompoundDataService],
      imports: [
        HttpModule
      ],
    });
  });

  it('should ...', inject([CompoundDataService], (service: CompoundDataService) => {
    expect(service).toBeTruthy();
  }));
});
