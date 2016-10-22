import { Injectable } from '@angular/core';
import * as models from '../models';

@Injectable()
export class ManipulateDataService {
    signatureOfCompound: models.Signature;
    relatedCompounds: models.Compound;
    zhang: models.Zhang;
    histogramData: models.HistData;
    knownTargets: models.KnownTargets;

    constructor() {
    }

    // setter function to save data and update the store flag
    setData(data: any, classPath: string): string {
      console.log('[manipulate service] set' + ' ' + classPath);
      switch (classPath) {
        case 'signature':
          this.signatureOfCompound = data;
          break;
        case 'compounds':
          this.relatedCompounds = data;
          break;
        case 'zhang':
          this.zhang = data;
          break;
        case 'targetHistogram':
          this.histogramData = data;
          break;
        case 'targetFrequency':
          this.knownTargets = data;
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
          return this.zhang;
        case 'targetHistogram':
          return this.histogramData;
        case 'knownTargets':
          return this.knownTargets;
      }
  }
}
