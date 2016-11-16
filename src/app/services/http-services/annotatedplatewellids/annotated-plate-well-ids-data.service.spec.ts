/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AnnotatedPlateWellIdsDataService } from './annotated-plate-well-ids-data.service';
import { HttpModule } from '@angular/http';

describe('Service: AnnotatedPlateWellIdsData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnnotatedPlateWellIdsDataService],
      imports: [
        HttpModule
      ],
    });
  });

  it('should ...', inject([AnnotatedPlateWellIdsDataService], (service: AnnotatedPlateWellIdsDataService) => {
    expect(service).toBeTruthy();
  }));
});
