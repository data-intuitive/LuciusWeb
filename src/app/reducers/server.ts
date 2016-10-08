import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ServerActionTypes } from '../actions/server';

// the settings object, as saved inside the store
export interface State {
  completed: boolean;
}

const initialState: State = {
  completed: false
};

export function reducer(state = initialState, action: Action) {
  switch (action.type) {

    case ServerActionTypes.FETCH_COMPLETE: {
       return Object.assign({}, {completed: action.payload});
    }

    default: {
      return state;
    }
  }
}

export function getServerCompleted(state$: Observable<State>) {
  return state$.select(state => state.completed);
}
