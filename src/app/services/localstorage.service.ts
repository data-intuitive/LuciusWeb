import { Injectable } from '@angular/core';
import { SettingsState } from '../reducers/settings';

const initialValues: SettingsState = {
  version: 1,
  complete: false,
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
  key: string = 'settings';

  constructor() {
  }

  setSettings(state: SettingsState): SettingsState {
    console.log('local storage service[set]!', state);
    localStorage.setItem(this.key, JSON.stringify(state));
    return state;
  }

  getSettings(): SettingsState {
    console.log('local storage service[get]!');
    return JSON.parse(localStorage.getItem(this.key));
  }

  init(): SettingsState {
    let settings: SettingsState = this.getSettings();
    if (
      !settings
      || !settings.version
      || settings.version !== initialValues.version
    ) {
      console.log('setting to LS');
      settings = this.setSettings(initialValues);
    }
    console.log('getting from LS ', settings);
    return settings;
  }
}
