import { Injectable } from '@angular/core';
import { Response } from '@angular/http';

import { APIEndpoints } from '../shared/api-endpoints';
import { Parser } from '../shared/parser';

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
        case APIEndpoints.signature:
          this.signature = data;
          break;
        case APIEndpoints.compounds:
          this.relatedCompounds = data;
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

    // getter function to get data
    getData(classPath: string): any {
      console.log('[handler service] get' + ' ' + classPath);
      switch (classPath) {
        case APIEndpoints.signature:
          return this.signature;
        case APIEndpoints.compounds:
          return this.relatedCompounds;
        case APIEndpoints.zhang:
          return Parser.parseZhangData(this.zhang);
        case APIEndpoints.targetHistogram:
          return Parser.parseSimilarityHistogramData(this.histogramData);
        case APIEndpoints.knownTargets:
          return Parser.parseKnownTargetsData(this.knownTargets);
        case APIEndpoints.annotatedPlateWellids:
          return Parser.parseAnnotatedPlateWellids(this.annotatedPlatewellids);
      }
  }
}
