import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { FetchDataService } from '../services/fetch-data.service';
import { ManipulateDataService } from '../services/manipulate-data.service';
import { Parser } from '../shared/url-parser';
import { Observable } from 'rxjs';

import * as server from '../actions/server';
import * as data from '../actions/data';
import * as fromRoot from '../reducers';

@Injectable()
export class ServerEffects {
  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private fetchDataService: FetchDataService,
    private manipulateDataService: ManipulateDataService
  ) {
  }

  @Effect() fetch$ = this.actions$
    .ofType(server.ServerActionTypes.FETCH)
    .withLatestFrom(this.store)
    .map(([action, store]) => ({
      url: Parser.parseURL(store.settings, action.payload),
      data: store.data}
    ))
    .switchMap(payload => this.fetchDataService.fetchData(
      payload.url, payload.data
    ))
    .map(result => new server.FetchCompleteAction(
      this.manipulateDataService.setData(
        result.data, result.type)
    ));

  @Effect() fetchNotSaved$ = this.actions$
    .ofType(server.ServerActionTypes.FETCH)
    .map(action => action.payload)
    .switchMap(payload => Observable.of(
      new data.NotSavedAction(payload)
    ));

  @Effect() fetchComplete$ = this.actions$
    .ofType(server.ServerActionTypes.FETCH_COMPLETE)
    .map(action => action.payload)
    .switchMap(payload => Observable.of(
      new data.SavedAction(payload)
    ));
}
