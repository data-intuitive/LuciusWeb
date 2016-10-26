import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
// import { Data } from '../models/data';
import { Parser } from '../shared/parser';

@Injectable()
export class FetchDataService {

  constructor(private http: Http) { }

  fetchData(URL: string, data: any): Observable<any> {
    console.log('[http service] fetch');
    let url = URL;
    let classPath = Parser.parseClassPath(url);
    let headers = new Headers({ 'Content-Type': 'text/plain' });
    let options = new RequestOptions({ headers: headers });
    console.log(url);

    switch (classPath) {
      case 'signature': {
        let body = 'compound=' + data.compound;
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch((error: any) => Observable
            .throw(error.json().error || 'Server error'));
      }

      case 'compounds': {
        let body = 'query=' + data.compound;
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch((error: any) => Observable
            .throw(error.json().error || 'Server error'));
      }

      case 'zhang': {
        let body = 'query=' + data.signature + ', sorted=true';
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch((error: any) => Observable
            .throw(error.json().error || 'Server error'));
      }

      case 'annotatedplatewellids': {
        let pwids = Parser.parsePwids(data.zhang.result).toString().replace(/,/g , ' ');
        let body = 'query=' + data.storeData.signature + ', features=jnjs id smiles' +
                    ', pwids = ' + pwids ;
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch((error: any) => Observable
            .throw(error.json().error || 'Server error'));
      }

      case 'targetFrequency': {
        let pwids = Parser.parsePwids(data.result).toString().replace(/,/g , ' ');
        let body = 'pwids=' + pwids;
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch((error: any) => Observable
            .throw(error.json().error || 'Server error'));
      }

      case 'targetHistogram': {
        let features = Parser.parsePwids(data.zhang.result).toString().replace(/,/g , ' ');
        let body = 'bins=' + data.bins + ', features=zhang ' + features
         + ', query=' + data.storeData.signature;
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch((error: any) => Observable
            .throw(error.json().error || 'Server error'));
      }

    }
  }
}
