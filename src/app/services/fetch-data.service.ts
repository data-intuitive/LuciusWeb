import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Parser } from '../shared/parser';
import { ApiEndpoints } from '../shared/api-endpoints';

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
      case ApiEndpoints.signature: {
        let body = 'compound=' + data.compound;
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch(this.handleError);
      }

      case ApiEndpoints.compounds: {
        let body = 'query=' + data.compound;
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch(this.handleError);
      }

      case ApiEndpoints.zhang: {
        let body = 'query=' + data.signature + ', sorted=true';
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch(this.handleError);
      }

      case ApiEndpoints.annotatedplatewellids: {
        let pwids = Parser.parsePwids(data.zhang.result).toString().replace(/,/g , ' ');
        let body = 'query=' + data.storeData.signature + ', features=jnjs id smiles' +
                    ', pwids = ' + pwids ;
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch(this.handleError);
      }

      case ApiEndpoints.targetFrequency: {
        let pwids = Parser.parsePwids(data.result).toString().replace(/,/g , ' ');
        let body = 'pwids=' + pwids;
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch(this.handleError);
      }

      case ApiEndpoints.targetHistogram: {
        let features = '';
        let body = 'bins=' + data.bins + ', features=zhang';
        if (features !== '') {
          body += ' ' + features;
        }
        body += ', query=' + data.storeData.signature;
        return this.http.post(url, body, options)
          .map(res => ({'data': res.json(), 'type': classPath}))
          .catch(this.handleError);
      }
    }
  }

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
