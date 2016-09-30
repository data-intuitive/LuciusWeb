import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';

import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';

import * as settings from '../actions/settings';
import { SettingsActions } from '../actions/settings';
import { SettingsState } from '../reducers/settings';
import { LocalStorageService } from '../services/localstorage.service';
import { StoreUtil } from '../shared';

@Injectable()
export class SettingsEffects {

  constructor(
    private actions$: Actions,
    private storeUtil: StoreUtil,
    private settingsActions: SettingsActions,
    private localStorageService: LocalStorageService
  ) {
  }

  /* effect triggered on settings initialization - uses localStorageService
     to retrieve SettingsState from LS and then triggers initComplete() action
     on the store to complete the initialization.
  */
  @Effect() initializeSettings$ = this.actions$
    .ofType(settings.SettingsActions.INIT)
    .map(_ => this.settingsActions.initComplete(
      this.localStorageService.init()
    ));

  /* effect triggered on settings update - uses localStorageService
     to save the new SettingsState to LS and then triggers updateComplete() action
     on the store to complete the update
  */
  @Effect() updateSettings$ = this.actions$
    .ofType(settings.SettingsActions.UPDATE)
    .map<SettingsState>(action => Object.assign({},
      this.storeUtil.getState().settings, action.payload
    ))
    .switchMap(payload => Observable.of(
      this.settingsActions.updateComplete(
        this.localStorageService.setSettings(payload)))
    );

}
