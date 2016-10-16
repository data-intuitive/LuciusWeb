import { Injectable } from '@angular/core';
import { Signature } from '../models/signature';
import { Compound } from '../models/compound';
import { Store } from '@ngrx/store';

import * as fromRoot from '../reducers';
import * as dataActions from '../actions/data';

@Injectable()
export class ManipulateDataService {
  signatureData: Signature;
  compoundData: Compound;

  constructor(private store: Store<fromRoot.State>) {
  }

  // setter function to save data and update the store flag
  setData(data: any, classPath: string): string {
    console.log('[manipulate service] set' + ' ' + classPath);
    switch (classPath) {
      case 'signature':
          this.signatureData = data;
          this.store.dispatch(new dataActions.UpdateCompoundAction(''));
          break;
      case 'compounds':
          this.compoundData = data;
          this.store.dispatch(new dataActions.UpdateSignatureAction(data.result));
          break;
    }
    return classPath;
  }

  // getter function to get data
  getData(classPath: string): any {
    console.log('[manipulate service] get' + ' ' + classPath);
    switch (classPath) {
      case 'signature':
        return this.signatureData;
      case 'compounds':
        return this.compoundData;
    }
  }
}
