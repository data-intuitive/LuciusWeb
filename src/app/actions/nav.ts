import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()
export class NavActions {
  static TOGGLE_SIDEBAR = '[Nav] TOGGLE Sidebar';
  toggleSidebar(open: Boolean): Action {
    return {
      type: NavActions.TOGGLE_SIDEBAR,
      payload: open
    };
  }
}
