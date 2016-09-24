import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { SettingsState } from '../reducers/settings';

@Injectable()
export class SettingsActions {
  static UPDATE_VALUES = '[Set] UPDATE_VALUES';
  static INITIALIZE_VALUES = '[Set] INITIALIZE_VALUES';

  updateSettingsValues(settingsValues: SettingsState): Action {
    return {
      type: SettingsActions.UPDATE_VALUES,
      payload: settingsValues
    };
  }

  initializeSettingsValues( ): Action {
    return {
      type: SettingsActions.INITIALIZE_VALUES
    };
  }
}
