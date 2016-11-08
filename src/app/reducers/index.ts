import { environment } from '../../environments/environment';

import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';
import { compose } from '@ngrx/core/compose';
import { storeFreeze } from 'ngrx-store-freeze';
import { combineReducers } from '@ngrx/store';

import * as fromLayout from './layout';
import * as fromSettings from './settings';
import * as fromServer from './server';
import * as fromData from './data';

export interface State {
  settings: fromSettings.State;
  layout: fromLayout.State;
  server: fromServer.State;
  data: fromData.State;
}

const reducers = {
  settings: fromSettings.reducer,
  layout: fromLayout.reducer,
  server: fromServer.reducer,
  data: fromData.reducer
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

export const getSettingsComplete = compose(
  fromSettings.getSettingsComplete, getSettingsState
);

/**
 * Layout Reducers
 */
export const getLayoutState = (state$: Observable<State>) =>
  state$.select(state => state.layout);

export const getShowSidenav = compose(
  fromLayout.getShowSidenav, getLayoutState
);

/**
 * Server Reducers
 */
 export const getServerState = (state$: Observable<State>) =>
   state$.select(state => state.server);

 export const getSignatureReady = compose(
   fromServer.getSignatureReady, getServerState
 );

 export const getCompoundReady = compose(
   fromServer.getCompoundReady, getServerState
 );

 export const getZhangReady = compose(
   fromServer.getZhangReady, getServerState
 );

 export const getSimilaritiesHistReady = compose(
   fromServer.getSimilaritiesHistReady, getServerState
 );

 export const getKnownTargetsReady = compose(
   fromServer.getKnownTargetsReady, getServerState
 );

 export const getAnnotatedPlatewellidsReady = compose(
   fromServer.getAnnotatedPlatewellidsReady, getServerState
 );

 /**
  * Data Reducers
  */
  export const getDataState = (state$: Observable<State>) =>
    state$.select(state => state.data);

  export const getSignature = compose(
    fromData.getSignature, getDataState
  );

  export const getCompound = compose(
    fromData.getCompound, getDataState
  );
