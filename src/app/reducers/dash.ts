import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import '@ngrx/core/add/operator/select';

 import { DashActions } from '../actions';

export interface DashState {
  active: Boolean;
};

const initialState: DashState = {
  active: true
};

export default function (state = initialState, action: Action): DashState {
  switch (action.type) {
    case DashActions.SET_DASH_ACTIVE: {
      return Object.assign({}, state, {
        active: action.payload
      });
    }

    default: {
      return state;
    }
  }
}

export function DashEnabled() {
  return (state$: Observable<DashState>) => state$
    .select(s => s.active);
};
