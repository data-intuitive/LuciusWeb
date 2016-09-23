import { Injectable } from '@angular/core';
// import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import 'rxjs';
import * as settings from '../actions';
import { SettingsState } from '../reducers/settings';
import { LocalStorageService } from '../services/localstorage.service';

@Injectable()
export class SettingsEffects {
  constructor(
    private actions$: Actions,
    private _localStorageService: LocalStorageService
  ) { }

  @Effect() updateSettings$ = this.actions$
    .ofType(settings.SettingsActions.UPDATE_VALUES)
    .map<SettingsState>(action => action.payload)
    .do(settings => {console.log('here!'); this._localStorageService.setObject('myObj', settings)});
}
