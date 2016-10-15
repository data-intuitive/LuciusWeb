import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Data } from '../models/data';
import { Parser } from '../shared/url-parser';

@Injectable()
export class FetchDataService {

  constructor(private http: Http) { }

  fetchData(URL: string, data: Data): Observable<any> {
    console.log('[http service] fetch');
    let url = URL;
    let classPath = Parser.parseClassPath(url);
    let headers = new Headers({ 'Content-Type': 'text/plain' });
    let options = new RequestOptions({ headers: headers });

    switch (classPath) {
      case 'signature': {
        let body = 'compound = ' + data.signature;
        console.log(url);
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
      }

      case 'compounds': {
        let body = 'query = ' + data.compound;
        console.log(url);
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
      }
    }
  }
}
