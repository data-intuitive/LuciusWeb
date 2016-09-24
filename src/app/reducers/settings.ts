import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import '@ngrx/core/add/operator/select';

import { SettingsActions } from '../actions';

export interface SettingsState {
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
    case SettingsActions.INIT_COMPLETE: {
      return Object.assign({}, state, action.payload);
    }

    case SettingsActions.UPDATE: {
      return Object.assign({}, state, {
        plotNoise: action.payload.plotNoise,
        hist2dBins: action.payload.hist2dBins,
        hist2dNoise: action.payload.hist2dNoise,
        histogramBins: action.payload.histogramBins,
        topComps: action.payload.topComps,
        serverURL: action.payload.serverURL,
        queryStr: action.payload.queryStr,
        classPath: action.payload.classPath,
        sourireURL: action.payload.sourireURL,
        hiddenComps: action.payload.hiddenComps,
      });
    }

    default: {
      return state;
    }
  }
}

export function getSettings() {
  return (state$: Observable<SettingsState>) => state$
    .select(s => s);
}
