import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
// import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { FetchDataService } from '../services/fetch-data.service';
import { ManipulateDataService } from '../services/manipulate-data.service';
import { Settings } from '../models/settings';

import * as server from '../actions/server';
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

  // TODO: change according to classPath, not hardcoded as below
  parseURL(settings: Settings) {
    return (settings.serverURL + '?' + settings.queryStr
            + '&classPath=' + settings.classPath + '.signature');
  }

  @Effect() fetch$ = this.actions$
    .ofType(server.ServerActionTypes.FETCH)
    .withLatestFrom(this.store)
    .map(([ , store]) => this.parseURL(store.settings))
    .switchMap(payload => this.fetchDataService.getData(payload))
    .map(result => new server.FetchComplete(this.manipulateDataService.setData(result)));
}
