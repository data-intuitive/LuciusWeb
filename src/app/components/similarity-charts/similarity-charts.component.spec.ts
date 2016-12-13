/* tslint:disable:no-unused-variable */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { MaterialModule } from '@angular/material';

import { SimilarityChartsComponent } from './similarity-charts.component';
import { SimilarityScatterComponent } from '../charts/similarity-scatter/similarity-scatter.component';
import { SimilarityHistogramComponent } from '../charts/similarity-histogram/similarity-histogram.component';

import { HandleDataService } from '../../services';
import { reducer } from '../../reducers';

let comp: SimilarityChartsComponent;
let fixture: ComponentFixture<SimilarityChartsComponent>;
let el: DebugElement;

describe('SimilarityChartsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
          MaterialModule.forRoot(),
          StoreModule.provideStore(reducer)
        ],
        providers: [
          HandleDataService
        ],
        declarations: [
          SimilarityChartsComponent,
          SimilarityScatterComponent,
          SimilarityHistogramComponent
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(SimilarityChartsComponent);
        comp = fixture.componentInstance;
        el = fixture.debugElement;
      });
  }));

  it('should create component', async(() => {
    expect(comp).toBeTruthy();
  }));

});
