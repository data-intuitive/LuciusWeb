/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ZhangDataService } from './zhang-data.service';
import { HttpModule } from '@angular/http';

describe('Service: ZhangData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [ZhangDataService]
    });
  });

  it('should ...', inject([ZhangDataService], (service: ZhangDataService) => {
    expect(service).toBeTruthy();
  }));
});
