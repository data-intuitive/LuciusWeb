import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import '@ngrx/core/add/operator/select';

import { LayoutActions } from '../actions';

export interface LayoutState {
  sidenavOpen: Boolean;
}

const initialState: LayoutState = {
  sidenavOpen: false
};

export default function (state = initialState, action: Action): LayoutState {
  switch (action.type) {
    case LayoutActions.TOGGLE_SIDENAV: {
      return Object.assign({}, state, {
        sidenavOpen: action.payload
      });
    }

    default: {
      return state;
    }
  }
}

export function getSidenavOpened() {
  return (state$: Observable<LayoutState>) => state$
    .select(s => s.sidenavOpen);
}
