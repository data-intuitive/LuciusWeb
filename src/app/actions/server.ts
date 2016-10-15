import { Action } from '@ngrx/store';

export const ServerActionTypes = {
  FETCH: '[Server] Fetch Server Data',
  FETCH_COMPLETE: '[Server] Fetch Server Data Complete'
};

export class FetchAction implements Action {
  type = ServerActionTypes.FETCH;

  constructor(public payload: string) {
  }
}

export class FetchCompleteAction implements Action {
  type = ServerActionTypes.FETCH_COMPLETE;

  constructor(public payload: string) {
  }
}

export type SettingsActions = FetchAction
  | FetchCompleteAction;
