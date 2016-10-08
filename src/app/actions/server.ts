import { Action } from '@ngrx/store';

export const ServerActionTypes = {
  FETCH: '[Server] Fetch Server Data',
  FETCH_COMPLETE: '[Server] Fetch Server Data Complete'
};

export class Fetch implements Action {
  type = ServerActionTypes.FETCH;

}

export class FetchComplete implements Action {
  type = ServerActionTypes.FETCH_COMPLETE;

  constructor(public payload: boolean) {
  }
}

export type SettingsActions = Fetch
  | FetchComplete;
