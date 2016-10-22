import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ManipulateDataService } from '../services/manipulate-data.service';

import * as server from '../actions/server';
import * as data from '../actions/data';
import * as fromRoot from '../reducers';

@Injectable()
export class DataEffects {
    constructor(
      private actions$: Actions,
      private store: Store<fromRoot.State>,
      private manipulateDataService: ManipulateDataService
    ) {
    }

    @Effect() updateCompound1$ = this.actions$
      .ofType(data.DataActionTypes.UPDATE_COMPOUND)
      .map(action => action.payload)
      .switchMapTo(Observable.of(
          new server.GetCompoundsByJNJAction('compounds'))
      );

    @Effect() updateCompound2$ = this.actions$
      .ofType(data.DataActionTypes.UPDATE_COMPOUND)
      .map(action => action.payload)
      .switchMapTo(Observable.of(
          new server.GetSignatureAction('signature'))
      );

    @Effect() updateSignature$ = this.actions$
      .ofType(data.DataActionTypes.UPDATE_SIGNATURE)
      .map(action => action.payload)
      .switchMap(payload => Observable.of(new server.GetSignatureSuccessAction(
        this.manipulateDataService.setData(payload, 'signature'))
      ));
}
