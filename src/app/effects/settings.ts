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

  @Effect() initializeSettings$ = this.actions$
    .ofType(settings.SettingsActions.INIT)
    .map(_ => this.settingsActions.initComplete(
      this.localStorageService.init()
    ));

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
