import { environment } from '../../environments/environment';

import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';
import { compose } from '@ngrx/core/compose';
import { storeFreeze } from 'ngrx-store-freeze';
import { combineReducers } from '@ngrx/store';

import * as fromLayout from './layout';
import * as fromSettings from './settings';

export interface State {
  settings: fromSettings.State;
  layout: fromLayout.State;
}

const reducers = {
  settings: fromSettings.reducer,
  layout: fromLayout.reducer
};

const developmentReducer: Function = compose(storeFreeze, combineReducers)(reducers);
const productionReducer = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
}

/**
 * Settings Reducers
 */
export const getSettingsState = (state$: Observable<State>) =>
  state$.select(state => state.settings);

export const getSettings = compose(
  fromSettings.getSettings, getSettingsState
);

/**
 * Layout Reducers
 */
export const getLayoutState = (state$: Observable<State>) =>
  state$.select(state => state.layout);

export const getShowSidenav = compose(
  fromLayout.getShowSidenav, getLayoutState
);
