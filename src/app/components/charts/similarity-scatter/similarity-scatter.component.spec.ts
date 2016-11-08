/* tslint:disable:no-unused-variable */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { SimilarityScatterComponent } from './similarity-scatter.component';
import { HandleDataService } from '../../../services/handle-data.service';
import { reducer } from '../../../reducers';

let comp: SimilarityScatterComponent;
let fixture: ComponentFixture<SimilarityScatterComponent>;
let el: DebugElement;

describe('SimilarityScatterComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.provideStore(reducer)
      ],
      providers: [
        HandleDataService
      ],
      declarations: [
        SimilarityScatterComponent
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(SimilarityScatterComponent);
      comp = fixture.componentInstance;
      el = fixture.debugElement;
    });
  }));

  it('should create', async(() => {
    expect(comp).toBeTruthy();
  }));

});
