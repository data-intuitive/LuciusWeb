import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { APIEndpoints } from '../../../shared/api-endpoints';

@Injectable()
export class AnnotatedPlateWellIdsDataService {

  constructor(private http: Http) { }

}
