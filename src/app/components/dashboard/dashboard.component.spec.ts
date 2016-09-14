/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

import { MdCoreModule } from '@angular2-material/core';
import { MdButtonModule } from '@angular2-material/button';
import { MdToolbarModule } from '@angular2-material/toolbar';
import { MdIconModule } from '@angular2-material/icon';

import { StoreModule } from '@ngrx/store';
import { reducers } from '../../reducers';
import { actions } from '../../actions';

describe('Component: Dashboard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        DashboardComponent
      ],
      imports: [
        MdCoreModule,
        MdButtonModule,
        MdIconModule,
        MdToolbarModule,

        StoreModule.provideStore(
          reducers
        )
      ],
      providers: [
        actions
      ],
    });
  });

  it('should create an instance', async(() => {
    let fixture = TestBed.createComponent(DashboardComponent);
    let element = fixture.debugElement.componentInstance;
    expect(element).toBeTruthy();
  }));

});
