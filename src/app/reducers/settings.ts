// import { Observable } from 'rxjs/Observable';
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

const initialState: SettingsState = {
    plotNoise: 0,
    hist2dBins: 8,
    hist2dNoise: 0,
    histogramBins: 8,
    topComps: 5,
    serverURL: '',
    queryStr: '',
    classPath: '',
    sourireURL: '',
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

// export function getSidenavOpened() {
//   return (state$: Observable<LayoutState>) => state$
//     .select(s => s.sidenavOpen);
// };
