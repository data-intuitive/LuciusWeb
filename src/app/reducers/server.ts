import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ServerActionTypes } from '../actions/server';

// the settings object, as saved inside the store
export interface State {
  signatureFetched: boolean;
  compoundFetched: boolean;
}

const initialState: State = {
  signatureFetched: false,
  compoundFetched: false
};

export function reducer(state = initialState, action: Action) {

  switch (action.type) {
    case ServerActionTypes.FETCH: {
      switch (action.payload) {
        case 'signature':
          return Object.assign({}, state, {signatureFetched: false});
        case 'compounds':
          return Object.assign({}, state, {compoundFetched: false});
      }
    }
    case ServerActionTypes.FETCH_COMPLETE: {
      switch (action.payload) {
        case 'signature':
          return Object.assign({}, state, {signatureFetched: true});
        case 'compounds':
          return Object.assign({}, state, {compoundFetched: true});
     }
    }
    default: {
      return state;
    }
  }
}

export function getSignatureFetched(state$: Observable<State>) {
  return state$.select(state => state.signatureFetched);
}

export function getCompoundFetched(state$: Observable<State>) {
  return state$.select(state => state.compoundFetched);
}
