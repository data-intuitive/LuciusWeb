import { Injectable } from '@angular/core';
import { Signature } from '../models/signature';
import { Compound } from '../models/compound';

@Injectable()
export class ManipulateDataService {
  signatureData: Signature;
  compoundData: Compound;

  constructor() {
  }

  // setter function to save data and update the store flag
  setData(data: any, type: string): string {
    console.log('[manipulate service] set' + ' ' + type);
    switch (type) {
      case 'signature':
            this.signatureData = data;
            break;
      case 'compounds':
          this.compoundData = data;
          break;
    }
    return type;
  }

  // getter function to get data
  getData(type: string): any {
    console.log('[manipulate service] get' + ' ' + type);
    switch (type) {
      case 'signature':
        return this.signatureData;
      case 'compounds':
        return this.compoundData;
    }
  }
}
