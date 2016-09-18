import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';

import { compose } from '@ngrx/core/compose';
import { storeLogger } from 'ngrx-store-logger';
import { storeFreeze } from 'ngrx-store-freeze';
import { combineReducers } from '@ngrx/store';

import layoutReducer, * as fromLayout from './layout';

export interface AppState {
  layout: fromLayout.LayoutState;
}

export const reducers = compose(storeFreeze, storeLogger(), combineReducers)({
  layout: layoutReducer
});

export function getLayoutState() {
  return (state$: Observable<AppState>) => state$
    .select(s => s.layout);
}

export function getSidenavOpened() {
  return compose(fromLayout.getSidenavOpened(), getLayoutState());
}
