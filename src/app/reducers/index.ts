import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';

import { compose } from '@ngrx/core/compose';
import { storeLogger } from 'ngrx-store-logger';
import { storeFreeze } from 'ngrx-store-freeze';
import { combineReducers } from '@ngrx/store';

import navReducer, * as fromNav from './nav';
import dashReducer, * as fromDash from './dash';

export interface AppState {
  nav: fromNav.NavState;
  dash: fromDash.DashState;
}

export const reducers = compose(storeFreeze, storeLogger(), combineReducers)({
  nav: navReducer,
  dash: dashReducer
});

export function getNavState() {
  return (state$: Observable<AppState>) => state$
    .select(s => s.nav);
}

export function getDashState() {
  return (state$: Observable<AppState>) => state$
    .select(s => s.dash);
}

export function getSidenavOpened() {
  return compose(fromNav.getSidenavOpened(), getNavState());
}

export function checkIfDashEnabled(){
  return compose(fromDash.DashEnabled(), getDashState());
}
