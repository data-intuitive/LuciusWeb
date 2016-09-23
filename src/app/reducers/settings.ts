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
};

/* initialize from localstorage
   check if there is object in LS else use mock
*/
const initialState: SettingsState = {
    plotNoise: 3,
    hist2dBins: 20,
    hist2dNoise: 0,
    histogramBins: 16,
    topComps: 25,
    serverURL: 'http://192.168.1.10:8090/jobs',
    queryStr: 'context=compass&appName=luciusapi&sync=true',
    classPath: 'luciusapi',
    sourireURL: 'http://192.168.1.10:9999',
    hiddenComps: false
};

export default function (state = initialState, action: Action): SettingsState {
  switch (action.type) {
    case SettingsActions.UPDATE_VALUES: {
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

export function getSettingsObject() {
  return (state$: Observable<SettingsState>) => state$
    .select(s => s);
};
