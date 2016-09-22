import { Injectable } from '@angular/core';
import { SettingsState } from '../reducers/settings';

@Injectable()
export class LocalStorageService {

  constructor() {

  }

  setObject(objectName: string, objectBody: SettingsState): void {
    console.log('here');
    localStorage.setItem(objectName, JSON.stringify(objectBody));
  }

  getObject(objectName: string): string {
    return localStorage.getItem(objectName);
  }
}
