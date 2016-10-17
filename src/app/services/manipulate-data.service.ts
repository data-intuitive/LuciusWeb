import { Injectable } from '@angular/core';
import { Signature } from '../models/signature';
import { Compound } from '../models/compound';
import { Zhang } from '../models/zhang';

import { Store } from '@ngrx/store';

import * as fromRoot from '../reducers';
import * as dataActions from '../actions/data';

@Injectable()
export class ManipulateDataService {
  signatureOfCompound: Signature;
  relatedCompounds: Compound;
  zhangData: Zhang;

  constructor(private store: Store<fromRoot.State>) {
  }

  // setter function to save data and update the store flag
  setData(data: any, classPath: string): string {
    console.log('[manipulate service] set' + ' ' + classPath);
    switch (classPath) {
      case 'signature':
        this.signatureOfCompound = data;
        this.store.dispatch(new dataActions.UpdateSignatureAction(data.result));
        break;
      case 'compounds':
        this.relatedCompounds = data;
        break;
      case 'zhang':
        this.zhangData = data;
        break;
    }
    return classPath;
  }

  // getter function to get data
  getData(classPath: string): any {
    console.log('[manipulate service] get' + ' ' + classPath);
    switch (classPath) {
      case 'signature':
        return this.signatureOfCompound;
      case 'compounds':
        return this.relatedCompounds;
      case 'zhang':
        return this.zhangData;
    }
  }
}
