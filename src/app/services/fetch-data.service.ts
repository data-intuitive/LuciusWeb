import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FetchDataService {

  constructor(private http: Http) { }

  getData(serverURL: String): Observable<any> {
    console.log('[http service] fetch');
    let url = serverURL.toString();

    // let headers = new Headers({ 'Content-Type': 'text/plain' });
    // let options = new RequestOptions({ headers: headers });

    // TODO: get the body of the request from the user input
    // let body = 'query = 397';

    return this.http.get(url)
      .map(res => res.json())
      .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

    // return this.http.post(url, body, options)
    //   .map(res => res.json())
    //   .catch((error: any) => Observable.throw(error.json().error || 'Server error'));

  }

}
