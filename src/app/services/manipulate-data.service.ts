import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class ManipulateDataService {
  serverdata: JSON;
  @Output() dataSaved: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  // setter function to save server data and emit it to components
  setData(data: JSON): boolean {
    console.log('[manipulate service] set');
    this.serverdata = data;
    this.dataSaved.emit(event);
    return true;
  }

  // getter function to get server data for any use
  getData(): JSON {
    console.log('[manipulate service] get');
    return this.serverdata;
  }

}
