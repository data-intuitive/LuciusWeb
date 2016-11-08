import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { HandleDataService } from '../services/handle-data.service';

import * as server from '../actions/server';
import * as data from '../actions/data';
import * as fromRoot from '../reducers';

/* API endpoints */
const signature = 'signature';
const compounds = 'compounds';

@Injectable()
export class DataEffects {
    constructor(
      private actions$: Actions,
      private store: Store<fromRoot.State>,
      private handleDataService: HandleDataService
    ) {
    }

    @Effect() getNewRelatedCompounds$ = this.actions$
      .ofType(data.DataActionTypes.UPDATE_COMPOUND)
      .map(action => action.payload)
      .switchMapTo(Observable.of(
          new server.GetCompoundsByJNJAction(compounds))
      );

    @Effect() getNewSignature$ = this.actions$
      .ofType(data.DataActionTypes.UPDATE_COMPOUND)
      .map(action => action.payload)
      .switchMapTo(Observable.of(
          new server.GetSignatureAction(signature))
      );

    @Effect() updateSignature$ = this.actions$
      .ofType(data.DataActionTypes.UPDATE_SIGNATURE)
      .map(action => action.payload)
      .switchMap(payload => Observable.of(new server.GetSignatureSuccessAction(
        this.handleDataService.setData(payload, signature))
      ));
}
