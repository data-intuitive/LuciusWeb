import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SettingsActions } from '../actions/settings';
import { AppState } from '../reducers';
import { Actions, Effect } from '@ngrx/effects';
import 'rxjs';
import * as settings from '../actions';
import { SettingsState } from '../reducers/settings';
import { LocalStorageService } from '../services/localstorage.service';

const initialValues: SettingsState = {
  plotNoise: 3,
  hist2dBins: 20,
  hist2dNoise: 0,
  histogramBins: 16,
  topComps: 25,
  serverURL: 'http://192.168.1.10:8090/jobs',
  queryStr: 'context=compass&appName=luciusapi&sync=tårue',
  classPath: 'luciusapi',
  sourireURL: 'http://192.168.1.10:9999',
  hiddenComps: false
};

@Injectable()
export class SettingsEffects {

  @Effect() updateSettings$ = this.actions$
    .ofType(settings.SettingsActions.UPDATE_VALUES)
    .map<SettingsState>(action => action.payload)
    .do(settings => {
                      console.log('update effect!');
                      this._localStorageService.setObject('setObj', settings);
                    })
    .filter(() => false);

  @Effect() initializeSettings$ = this.actions$
    .ofType(settings.SettingsActions.INITIALIZE_VALUES)
    .do(settings => {
                      console.log('init effect!');
                      let setObj = this._localStorageService.getObject('setObj');
                      if (setObj === null || setObj === 'undefined') {
                        console.log('setting to LS');
                        this._localStorageService.setObject('setObj', initialValues);
                      }
                      console.log('getting from LS and updating store');
                      this.store.dispatch(this.settingsActions
                        .updateSettingsValues(JSON.parse(this._localStorageService.getObject('setObj'))));
                     })
    .filter(() => false);

    constructor(
      private actions$: Actions,
      private _localStorageService: LocalStorageService,
      private store: Store<AppState>,
      private settingsActions: SettingsActions,
    ) { }
}
