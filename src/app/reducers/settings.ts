import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs';
import { Action } from '@ngrx/store';

import { SettingsActionTypes } from '../actions/settings';
import { Settings } from '../models/settings';

// the settings object, as saved inside the store
export interface State extends Settings {}

export function reducer(state = {}, action: Action) {
  switch (action.type) {

    // action to initialize the settings values in the store
    case SettingsActionTypes.INIT_COMPLETE: {
      return Object.assign({}, action.payload, {complete: true});
    }

    // action to update the settings values in the store
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

