import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { APIEndpoints } from '../../../shared/api-endpoints';
import { Zhang } from '../../../models';

@Injectable()
export class ZhangDataService {

  constructor(private http: Http) { }

  fetchData(URL: string, data: any): Observable<any> {
    console.log('[http service] fetch');
    let url = URL;
    let classPath = APIEndpoints.zhang;
    let headers = new Headers({ 'Content-Type': 'text/plain' });
    let options = new RequestOptions({ headers: headers });
    console.log(url);

    let body = 'query=' + data.signature + ', sorted=true';
    return this.http.post(url, body, options)
      .map(res => (this.handleResponse(res, classPath)))
      .catch(this.handleError);
  }

  /* function to handle Response from server and return desired Object */
  private handleResponse(res: Response, classPath: string) {
    /* TODO : Perform some check on the Response code */
    let data = res.json();
    let parsedZhangData = this.parseZhangData(data.result);
    let returnObject = {'data': parsedZhangData, 'type': classPath };
    return returnObject;
  }

  /* function to parse Zhang data from server Response */
  private parseZhangData(zhang): Zhang[] {
    let result: Zhang[] = Array();

    for (let i = 0; i < zhang.length; i++) {
      let obj = <Zhang>{};
      obj.indexSorted = +zhang[i][0];
      obj.zhangScore = +zhang[i][1];
      obj.indexUnSorted = +zhang[i][2];
      obj.pwid = zhang[i][3];
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
