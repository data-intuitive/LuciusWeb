import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';

import { compose } from '@ngrx/core/compose';
import { storeLogger } from 'ngrx-store-logger';
import { storeFreeze } from 'ngrx-store-freeze';
import { combineReducers } from '@ngrx/store';

import navReducer, * as fromNav from './nav';

export interface AppState {
  nav: fromNav.NavState;
}

export const reducers = compose(storeFreeze, storeLogger(), combineReducers)({
  nav: navReducer
});

export function getNavState() {
  return (state$: Observable<AppState>) => state$
    .select(s => s.nav);
}

export function getSidenavOpened() {
  return compose(fromNav.getSidenavOpened(), getNavState());
}
