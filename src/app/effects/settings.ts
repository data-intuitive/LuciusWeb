import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { LocalStorageService } from '../services/localstorage.service';
import { Settings } from '../models/settings';
import * as settings from '../actions/settings';
import * as fromRoot from '../reducers';

@Injectable()
export class SettingsEffects {
  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private localStorageService: LocalStorageService
  ) {
  }

  // effect triggered on settings initialization - uses localStorageService
  // to retrieve SettingsState from LS and then triggers initComplete() action
  // on the store to complete the initialization
  @Effect() init$ = this.actions$
    .ofType(settings.SettingsActionTypes.INIT)
    .mapTo(new settings.InitComplete(
      this.localStorageService.init()
    ));

  // effect triggered on settings update - uses localStorageService to save
  // the new SettingsState in LS and then triggers updateComplete() action
  // on the store to complete the update
  @Effect() update$ = this.actions$
    .ofType(settings.SettingsActionTypes.UPDATE)
    .withLatestFrom(this.store)
    .map<Settings>(([action, store]) => Object.assign({},
      store.settings, action.payload
    ))
    .switchMap(payload => Observable.of(
      new settings.UpdateComplete(
        this.localStorageService.setSettings(payload)))
    );

}
