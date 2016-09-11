/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';

import { AppState } from '../../reducers';
import { NavActions } from '../../actions/nav';

describe('Component: Dashboard', () => {
  it('should create an instance', () => {
    let component = new DashboardComponent(null, null);
    expect(component).toBeTruthy();
  });
});
