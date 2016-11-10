import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { ApiEndpoints } from '../shared/api-endpoints';

@Injectable()
export class HandleDataService {
    signature: Response;
    relatedCompounds: Response;
    zhang: Response;
    histogramData: Response;
    knownTargets: Response;
    annotatedPlatewellids: Response;

    constructor() {
    }

    // setter function to save data and update the store flag
    setData(data: any, classPath: string): string {
      console.log('[handler service] set' + ' ' + classPath);
      switch (classPath) {
        case ApiEndpoints.signature:
          this.signature = data;
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
        case ApiEndpoints.annotatedPlateWellids:
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
          return this.signature;
        case ApiEndpoints.compounds:
          return this.relatedCompounds;
        case ApiEndpoints.zhang:
          return this.zhang;
        case ApiEndpoints.targetHistogram:
          return this.histogramData;
        case ApiEndpoints.knownTargets:
          return this.knownTargets;
        case ApiEndpoints.annotatedPlateWellids:
          return this.annotatedPlatewellids;
      }
  }
}
