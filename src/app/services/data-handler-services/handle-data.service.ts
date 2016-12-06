import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { APIEndpoints } from '../../shared/api-endpoints';

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

    // setter function to save data coming from the server
    setData(data: any, classPath: string): string {
      console.log('[handler service] set' + ' ' + classPath);
      switch (classPath) {
        case APIEndpoints.compounds:
          this.relatedCompounds = data;
          break;
        case APIEndpoints.signature:
          this.signature = data;
          break;
        case APIEndpoints.zhang:
          this.zhang = data;
          break;
        case APIEndpoints.targetHistogram:
          this.histogramData = data;
          break;
        case APIEndpoints.targetFrequency:
          this.knownTargets = data;
          break;
        case APIEndpoints.annotatedPlateWellids:
          this.annotatedPlatewellids = data;
          break;
      }
      return classPath;
    }

    // getter function to get data coming from the server
    getData(classPath: string): any {
      console.log('[handler service] get' + ' ' + classPath);
      switch (classPath) {
        case APIEndpoints.compounds:
          return this.relatedCompounds;
        case APIEndpoints.signature:
          return this.signature;
        case APIEndpoints.zhang:
          return this.zhang;
        case APIEndpoints.annotatedPlateWellids:
          return this.annotatedPlatewellids;
        case APIEndpoints.targetHistogram:
          return this.histogramData;
        case APIEndpoints.knownTargets:
          return this.knownTargets;
      }
  }
}
