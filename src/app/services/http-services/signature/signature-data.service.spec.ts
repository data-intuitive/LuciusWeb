/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SignatureDataService } from './signature-data.service';

describe('Service: SignatureData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SignatureDataService]
    });
  });

  it('should ...', inject([SignatureDataService], (service: SignatureDataService) => {
    expect(service).toBeTruthy();
  }));
});
