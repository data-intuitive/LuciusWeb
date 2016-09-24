import { Injectable } from '@angular/core';
import { SettingsState } from '../reducers/settings';

@Injectable()
export class LocalStorageService {

  constructor() { }

  setObject(objectName: string, objectBody: SettingsState): void {
    console.log('inside local service[set]!');
    localStorage.setItem(objectName, JSON.stringify(objectBody));
  }

  getObject(objectName: string): string {
    console.log('inside local service[get]!');
    return localStorage.getItem(objectName);
  }
}
