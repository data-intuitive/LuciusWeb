import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { APIEndpoints } from '../../../shared/api-endpoints';
import { Parser } from '../../../shared/parser';

@Injectable()
export class AnnotatedPlateWellIdsDataService {

  constructor(private http: Http) { }

  fetchData(URL: string, data: any): Observable<any> {
    console.log('[http service] fetch');
    let url = URL;
    let classPath = APIEndpoints.annotatedPlateWellids;
    let headers = new Headers({ 'Content-Type': 'text/plain' });
    let options = new RequestOptions({ headers: headers });
    console.log(url);

    let pwids = Parser.parsePwids(data.zhang);
    let body = 'query=' + data.storeData.signature + ', pwids = ' + pwids ;
    return this.http.post(url, body, options)
      .map(res => (this.handleResponse(res, classPath)))
      .catch(this.handleError);
  }

  /* function to handle Response from server and return desired Object */
  private handleResponse(res: Response, classPath: string) {
    /* TODO : Perform some check on the Response code */
    let data = res.json();
    let returnObject = {'data': data.result, 'type': classPath };
    return returnObject;
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
