import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

interface SettingsValues {
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
};

@Injectable()
export class SettingsActions {
  static UPDATE_VALUES = '[Set] UPDATE_VALUES';

  updateValues(settingsValues: SettingsValues): Action {
    return {
      type: SettingsActions.UPDATE_VALUES,
      payload: settingsValues
    };
  }
}
