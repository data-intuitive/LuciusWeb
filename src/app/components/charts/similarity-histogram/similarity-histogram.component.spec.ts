/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SimilarityHistogramComponent } from './similarity-histogram.component';
import { Settings } from '../../../models';

describe('SimilarityHistogramComponent', () => {
  let component: SimilarityHistogramComponent;
  let fixture: ComponentFixture<SimilarityHistogramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimilarityHistogramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimilarityHistogramComponent);
    component = fixture.componentInstance;
    component.settings = {
      version: 1,
      complete: false,
      plotNoise: 3,
      hist2dBins: 20,
      hist2dNoise: 0,
      histogramBins: 16,
      topComps: 25,
      serverURL: 'http://192.168.1.100:8090/jobs',
      queryStr: 'context=compass&appName=luciusapi&sync=true',
      classPath: 'luciusapi',
      sourireURL: 'http://192.168.1.100:9999',
      hiddenComps: false
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
