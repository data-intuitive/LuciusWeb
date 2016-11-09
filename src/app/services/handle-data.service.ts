import { Injectable } from '@angular/core';
import * as models from '../models';
import { ApiEndpoints } from '../shared/api-endpoints';

@Injectable()
export class HandleDataService {
    signatureOfCompound: models.Signature;
    relatedCompounds: models.Compound;
    zhang: models.Zhang;
    histogramData: models.HistData;
    knownTargets: models.KnownTargets;
    annotatedPlatewellids: models.AnnotatedPlatewellids;

    constructor() {
    }

    // setter function to save data and update the store flag
    setData(data: any, classPath: string): string {
      console.log('[handler service] set' + ' ' + classPath);
      switch (classPath) {
        case ApiEndpoints.signature:
          this.signatureOfCompound = data;
          break;
        case ApiEndpoints.compounds:
          this.relatedCompounds = data;
          break;
        case ApiEndpoints.zhang:
          this.zhang = data;
          break;
        case ApiEndpoints.targetHistogram:
          this.histogramData = data;
          break;
        case ApiEndpoints.targetFrequency:
          this.knownTargets = data;
          break;
        case ApiEndpoints.annotatedplatewellids:
          this.annotatedPlatewellids = data;
          break;
      }
      return classPath;
    }

    // getter function to get data
    getData(classPath: string): any {
      console.log('[handler service] get' + ' ' + classPath);
      switch (classPath) {
        case ApiEndpoints.signature:
          return this.signatureOfCompound;
        case ApiEndpoints.compounds:
          return this.relatedCompounds;
        case ApiEndpoints.zhang:
          return this.zhang;
        case ApiEndpoints.targetHistogram:
          return this.histogramData;
        case ApiEndpoints.knownTargets:
          return this.knownTargets;
        case ApiEndpoints.annotatedplatewellids:
          return this.annotatedPlatewellids;
      }
  }
}
