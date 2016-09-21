import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

export interface SettingsObject {
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

  updateSettingsValues(settingsValues: SettingsObject): Action {
    return {
      type: SettingsActions.UPDATE_VALUES,
      payload: settingsValues
    };
  }
}
