import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';

import { compose } from '@ngrx/core/compose';
import { storeLogger } from 'ngrx-store-logger';
import { storeFreeze } from 'ngrx-store-freeze';
import { combineReducers } from '@ngrx/store';

import layoutReducer, * as fromLayout from './layout';
import settingsReducer, * as fromSettings from './settings';

export interface AppState {
  layout: fromLayout.LayoutState;
  settings: fromSettings.SettingsState;
}

export const reducers = compose(storeFreeze, storeLogger(), combineReducers)({
  layout: layoutReducer,
  settings: settingsReducer
});

export function getLayoutState() {
  return (state$: Observable<AppState>) => state$
    .select(s => s.layout);
}

export function getSidenavOpened() {
  return compose(fromLayout.getSidenavOpened(), getLayoutState());
}

export function getSettingsState() {
  return (state$: Observable<AppState>) => state$
    .select(s => s.settings);
}

export function getSettings() {
  return compose(fromSettings.getSettings(), getSettingsState());
}
