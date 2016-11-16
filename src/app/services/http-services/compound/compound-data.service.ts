import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { APIEndpoints } from '../../../shared/api-endpoints';
import { CompoundEnum } from '../../../models';

@Injectable()
export class CompoundDataService {

  constructor(private http: Http) { }

  fetchData(URL: string, data: string): Observable<any> {
    console.log('[http service] fetch');
    let url = URL;
    let classPath = APIEndpoints.compounds;
    let headers = new Headers({ 'Content-Type': 'text/plain' });
    let options = new RequestOptions({ headers: headers });
    console.log(url);

    let body = 'query=' + data;
    return this.http.post(url, body, options)
      .map(res => (this.handleResponse(res, classPath)))
      .catch(this.handleError);
    }

    /* function to handle Response from server and return desired Object */
    private handleResponse(res: Response, classPath: string) {
      /* TODO : Perform some check on the Response code */
      let data = res.json();
      let parsedRelatedCompounds = this.parseRelatedCompounds(data.result);

      let returnObject = {'data': parsedRelatedCompounds, 'type': classPath };
      return returnObject;
    }

    /* function to parse Related Compounds from server response */
    private parseRelatedCompounds(relatedCompounds): string[] {
      let relatedCompoundsArray: string[] = Array();
      for (let i = 0; i < relatedCompounds.length; i++) {
        relatedCompoundsArray[i] = relatedCompounds[i][CompoundEnum.relatedJNJ]
          .toString();
      }
      return relatedCompoundsArray;
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
