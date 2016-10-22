import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs';
import { Action } from '@ngrx/store';

import { SettingsActionTypes } from '../actions/settings';
import { Settings } from '../models/settings';

// the settings object, as saved inside the store
export interface State extends Settings {}

export function reducer(state = {}, action: Action) {
  switch (action.type) {

    // 1. action to initialize the settings state
    // 2. action to update the settings state
    case SettingsActionTypes.INIT_COMPLETE:

    case SettingsActionTypes.UPDATE_COMPLETE: {
      return Object.assign({}, action.payload, {complete: true});
    }

    default: {
      return state;
    }
  }
}

export function getSettings(state$: Observable<State>) {
  return state$.select(state => state);
}

export function getSettingsComplete(state$: Observable<State>) {
  return state$.select(state => state.complete);
}
