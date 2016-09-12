import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()
export class NavActions {
  static TOGGLE_SIDENAV = '[Nav] TOGGLE Sidenav';
  toggleSidenav(open: Boolean): Action {
    return {
      type: NavActions.TOGGLE_SIDENAV,
      payload: open
    };
  }
}
