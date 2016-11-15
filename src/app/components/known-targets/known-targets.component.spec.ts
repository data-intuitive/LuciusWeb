/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { reducer } from '../../reducers';
import { KnownTargetsComponent } from './known-targets.component';
import { HandleDataService } from '../../services/handle-data.service';

import { KnownTargetsHistogramComponent } from '../charts/known-targets-histogram/known-targets-histogram.component';

describe('KnownTargetsHistogramComponent', () => {
  let component: KnownTargetsComponent;
  let fixture: ComponentFixture<KnownTargetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.provideStore(reducer)
      ],
      providers: [ HandleDataService ],
      declarations: [
        KnownTargetsComponent,
        KnownTargetsHistogramComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnownTargetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
