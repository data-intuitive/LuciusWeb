import { Action } from '@ngrx/store';

import * as fromSettings from '../reducers/settings';

export const SettingsActionTypes = {
  INIT: '[Setttings] Init',
  INIT_COMPLETE: '[Settings] Init Complete',
  UPDATE: '[Setttings] Update',
  UPDATE_COMPLETE: '[Setttings] Update Complete',
};

export class Init implements Action {
  type = SettingsActionTypes.INIT;
}

export class InitComplete implements Action {
  type = SettingsActionTypes.INIT_COMPLETE;

  constructor(public payload: fromSettings.State) {
  }
}

export class Update implements Action {
  type = SettingsActionTypes.UPDATE;

  constructor(public payload: fromSettings.State) {
  }
}

export class UpdateComplete implements Action {
  type = SettingsActionTypes.UPDATE_COMPLETE;

  constructor(public payload: fromSettings.State) {
  }
}

export type SettingsActions = Init
  | InitComplete
  | Update
  | UpdateComplete;
