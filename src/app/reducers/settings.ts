import { Action } from '@ngrx/store';
import '@ngrx/core/add/operator/select';

import { SettingsActions } from '../actions';

// the settings object, as saved inside the store
export interface SettingsState {
  version: Number;
  complete: Boolean;
  plotNoise: Number;
  hist2dBins: Number;
  hist2dNoise: Number;
  histogramBins: Number;
  topComps: Number;
  serverURL: String;
  queryStr: String;
  classPath: String;
  sourireURL: String;
  hiddenComps: Boolean;
}

export default function (state: SettingsState, action: Action) {
  switch (action.type) {

    // action to initialize the settings values in the store
    case SettingsActions.INIT_COMPLETE: {
      return Object.assign({}, action.payload, {complete: true});
    }

    // action to update the settings values in the store
    case SettingsActions.UPDATE_COMPLETE: {
      return Object.assign({}, action.payload, {complete: true});
    }

    default: {
      return state;
    }
  }
}
