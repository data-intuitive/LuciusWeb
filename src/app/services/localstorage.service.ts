import { Injectable } from '@angular/core';
import { SettingsState } from '../reducers/settings';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers';
import { SettingsActions } from '../actions/settings';

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
export class LocalStorageService {

  constructor(
    private store: Store<AppState>,
    private settingsActions: SettingsActions
  ) { }

  setObject(objectName: string, objectBody: SettingsState): void {
    console.log('local storage service[set]!');
    localStorage.setItem(objectName, JSON.stringify(objectBody));
  }

  getObject(objectName: string): string {
    console.log('local storage service[get]!');
    return localStorage.getItem(objectName);
  }

  InitSettings(): void {
    let exists = this.getObject('setObj');
    if (exists === null || exists === 'undefined') {
      console.log('setting to LS');
      this.setObject('setObj', initialValues);
    }
    let setObj = JSON.parse(this.getObject('setObj'));
    console.log('getting from LS - updating store');
    this.store.dispatch(this.settingsActions.updateSettingsValues(setObj));
  }
}
