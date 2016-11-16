import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { APIEndpoints } from '../../../shared/api-endpoints';
import { Parser } from '../../../shared/parser';
import { KnownTargetEnum } from '../../../models';

interface KnownTarget {
  gene: string;
  frequency: number;
}

@Injectable()
export class TargetFrequencyDataService {

  constructor(private http: Http) { }
  fetchData(URL: string, data: any): Observable<any> {
    console.log('[http service] fetch');
    let url = URL;
    let classPath = APIEndpoints.targetFrequency;
    let headers = new Headers({ 'Content-Type': 'text/plain' });
    let options = new RequestOptions({ headers: headers });
    console.log(url);

    let pwids = Parser.parsePwids(data);
    let body = 'pwids=' + pwids;
    return this.http.post(url, body, options)
      .map(res => (this.handleResponse(res, classPath)))
      .catch(this.handleError);
  }

  /* function to handle Response from server and return desired Object */
  private handleResponse(res: Response, classPath: string) {
    /* TODO : Perform some check on the Response code */
    let data = res.json();
    let parsedKnownTargetsData = this.parseKnownTargetsData(data.result);
    let returnObject = {'data': parsedKnownTargetsData, 'type': classPath };
    return returnObject;
  }

  /* function to parse Known Targets Data from server Response */
  parseKnownTargetsData(knownTargets): KnownTarget[] {
    let result: KnownTarget[] = Array();

    for (let i = 0; i < knownTargets.length; i++) {
      let obj = <KnownTarget>{};
      obj.gene = knownTargets[i][KnownTargetEnum.gene];
      obj.frequency = +knownTargets[i][KnownTargetEnum.frequency];
      result[i] = obj;
    }
    return result;
  }

  /* function to handle Error occuring from interaction with the server */
  private handleError (error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
