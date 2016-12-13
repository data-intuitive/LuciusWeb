import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { APIEndpoints } from '../../../shared/api-endpoints';

@Injectable()
export class BinnedZhangDataService {

  constructor(private http: Http) { }

  fetchData(URL: string, data: any): Observable<any> {
    console.log('[http service] fetch');
    let url = 'http://192.168.1.100:8090/jobs?context=luciusapi&appName' +
              '=luciusapi&classPath=com.dataintuitive.luciusapi.binnedZhang&sync=true';
    let classPath = APIEndpoints.binnedZhang;
    let headers = new Headers({ 'Content-Type': 'text/plain' });
    let options = new RequestOptions({ headers: headers });
    let binsX = 10;
    let binsY = 10;
    console.log(url);

    let body = {'query': data.signature,
                'binsX': binsX.toString(),
                'binsY': binsY.toString(),
                'version': 'v2'};

    return this.http.post(url, body, options)
      .map(res => (this.handleResponse(res, classPath)))
      .catch(this.handleError);
  }

  /* function to handle Response from server and return desired Object */
  private handleResponse(res: Response, classPath: string) {
    /* TODO : Perform some check on the Response code */
    let data = res.json();
    let binnedZhang = data.result.data;
    let returnObject = {'data': binnedZhang, 'type': classPath};
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
