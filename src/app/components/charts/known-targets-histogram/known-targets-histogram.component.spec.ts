/* tslint:disable:no-unused-variable */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { KnownTargetsHistogramComponent } from './known-targets-histogram.component';
import { HandleDataService } from '../../../services';
import { reducer } from '../../../reducers';

let comp: KnownTargetsHistogramComponent;
let fixture: ComponentFixture<KnownTargetsHistogramComponent>;
let el: DebugElement;

describe('KnownTargetsHistogramComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
          StoreModule.provideStore(reducer)
        ],
        providers: [
          HandleDataService
        ],
        declarations: [
          KnownTargetsHistogramComponent
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(KnownTargetsHistogramComponent);
        comp = fixture.componentInstance;
        el = fixture.debugElement;
      });
  }));

  it('should create component', async(() => {
    expect(comp).toBeTruthy();
  }));

});
