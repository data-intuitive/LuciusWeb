import { Injectable } from '@angular/core';
import { Settings } from '../../models/settings';

// desired initial values for settings
const initialValues: Settings = {
  version: 1,
  complete: false,
  plotNoise: 3,
  hist2dBins: 20,
  hist2dNoise: 0,
  histogramBins: 16,
  topComps: 25,
  serverURL: 'http://192.168.1.100:8090/jobs',
  queryStr: 'context=compass&appName=luciusapi&sync=true',
  classPath: 'luciusapi',
  sourireURL: 'http://192.168.1.100:9999',
  hiddenComps: false
};

@Injectable()
export class LocalStorageService {
  key: string = 'settings';

  constructor() {
  }

  // method to save object in LS and return it to the caller
  setSettings(settings: Settings): Settings {
    localStorage.setItem(this.key, JSON.stringify(settings));
    return settings;
  }

  // method to load object from LS and return it to the caller
  getSettings(): Settings {
    return JSON.parse(localStorage.getItem(this.key));
  }

  // method to check if settings object exists in LS - if yes it returns this
  // object, if no it initializes one with the desired values and returns it
  init(): Settings {
    let settings: Settings = this.getSettings();
    if (
      !settings
      || !settings.version
      || settings.version !== initialValues.version
    ) {
      settings = this.setSettings(initialValues);
    }
    return settings;
  }
}
