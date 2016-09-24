import { Injectable } from '@angular/core';
import { SettingsState } from '../reducers/settings';

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
  key: string = 'settings';

  constructor() {
  }

  setSettings(state: SettingsState): SettingsState {
    console.log('local storage service[set]!');
    localStorage.setItem(this.key, JSON.stringify(state));
    return state;
  }

  getSettings(): string {
    console.log('local storage service[get]!');
    return localStorage.getItem(this.key);
  }

  init(): SettingsState {
    let settings = this.getSettings();
    if (!settings) {
      console.log('setting to LS');
      this.setSettings(initialValues);
    }
    console.log('getting from LS ', settings);
    return JSON.parse(settings);
  }
}
