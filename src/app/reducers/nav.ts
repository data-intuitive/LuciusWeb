import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import '@ngrx/core/add/operator/select';

import { NavActions } from '../actions';


export interface NavState {
  open: Boolean;
};

const initialState: NavState = {
  open: false
};

export default function (state = initialState, action: Action): NavState {
  switch (action.type) {
    case NavActions.TOGGLE_SIDENAV: {
      return Object.assign({}, state, {
        open: action.payload
      });
    }

    default: {
      return state;
    }
  }
}

export function getSidenavOpened() {
  return (state$: Observable<NavState>) => state$
    .select(s => s.open);
};
