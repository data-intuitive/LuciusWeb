import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()
export class LayoutActions {
  static TOGGLE_SIDENAV = '[Nav] TOGGLE Sidenav';

  toggleSidenav(opened: Boolean): Action {
    return {
      type: LayoutActions.TOGGLE_SIDENAV,
      payload: opened
    };
  }
}
