import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()
export class DashActions {
  static SET_DASH_ACTIVE = '[Dash] ACTIVATE Dashboard';
  activateDashboard(active: Boolean): Action {
    return {
      type: DashActions.SET_DASH_ACTIVE,
      payload: active
    };
  }
}
