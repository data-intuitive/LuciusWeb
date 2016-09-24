import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { SettingsState } from '../reducers/settings';

@Injectable()
export class SettingsActions {
  static INIT = '[Setttings] Init';
  static INIT_COMPLETE = '[Settings] Init Complete';
  static UPDATE = '[Setttings] Update';
  static UPDATE_COMPLETE = '[Setttings] Update Complete';

  init(): Action {
    return {
      type: SettingsActions.INIT
    };
  }

  initComplete(state: SettingsState): Action {
    return {
      type: SettingsActions.INIT_COMPLETE,
      payload: state
    };
  }

  update(state: SettingsState): Action {
    return {
      type: SettingsActions.UPDATE,
      payload: state
    };
  }

  updateComplete(state: SettingsState): Action {
    return {
      type: SettingsActions.UPDATE_COMPLETE,
      payload: state
    };
  }
}
