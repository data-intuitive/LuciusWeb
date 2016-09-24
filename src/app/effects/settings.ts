import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';
import * as settings from '../actions/settings';
import { SettingsState } from '../reducers/settings';
import { LocalStorageService } from '../services/localstorage.service';

@Injectable()
export class SettingsEffects {

  @Effect() updateSettings$ = this.actions$
    .ofType(settings.SettingsActions.UPDATE_VALUES)
    .map<SettingsState>(action => action.payload)
    .do(settings => {
      console.log('update effect!');
      this.localStorageService.setObject('setObj', settings);
    })
    .filter(() => false);

  @Effect() initializeSettings$ = this.actions$
    .ofType(settings.SettingsActions.INITIALIZE_VALUES)
    .do(() => {
      console.log('init effect!');
      this.localStorageService.InitSettings();
    })
    .filter(() => false);

    constructor(
      private actions$: Actions,
      private localStorageService: LocalStorageService,
    ) { }
}
