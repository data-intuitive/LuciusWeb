import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as server from '../actions/server';
import * as data from '../actions/data';
import * as fromRoot from '../reducers';

import { HandleDataService } from '../services';
import { APIEndpoints } from '../shared/api-endpoints';

@Injectable()
export class DataEffects {
    constructor(
      private actions$: Actions,
      private store: Store<fromRoot.State>,
      private handleDataService: HandleDataService
    ) {
    }

    @Effect() updateCompound$ = this.actions$
      .ofType(data.DataActionTypes.UPDATE_COMPOUND)
      .map(action => action.payload)
      .switchMapTo(Observable.from([
          new server.GetCompoundsByJNJAction(APIEndpoints.compounds),
          new server.GetSignatureAction(APIEndpoints.signature)
        ])
      );

    @Effect() updateSignature$ = this.actions$
      .ofType(data.DataActionTypes.UPDATE_SIGNATURE)
      .map(action => action.payload)
      .switchMap(payload => Observable.of(new server.GetSignatureSuccessAction(
        this.handleDataService.setData(payload, APIEndpoints.signature))
      ));
}
