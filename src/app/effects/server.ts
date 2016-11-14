import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as server from '../actions/server';
import * as fromRoot from '../reducers';
import * as data from '../actions/data';

import { FetchDataService } from '../services/fetch-data.service';
import { HandleDataService } from '../services/handle-data.service';
import { Parser } from '../shared/parser';
import { ApiEndpoints } from '../shared/api-endpoints';

@Injectable()
export class ServerEffects {
  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private fetchDataService: FetchDataService,
    private handleDataService: HandleDataService
  ) {
  }

    @Effect() getCompoundsByJNJ$ = this.actions$
      .ofType(server.ServerActionTypes.GET_COMPOUNDS_BY_JNJ)
      .withLatestFrom(this.store)
      .map(([action, store]) => ({
        url: Parser.parseURL(store.settings, action.payload),
        data: store.data}
      ))
      .switchMap(payload => this.fetchDataService.fetchData(
        payload.url, payload.data
      ))
      .map(result => new server.GetCompoundsByJNJSuccessAction(
        this.handleDataService.setData(
          result.data, result.type)
      ));

      @Effect() getSignature$ = this.actions$
        .ofType(server.ServerActionTypes.GET_SIGNATURE)
        .withLatestFrom(this.store)
        .map(([action, store]) => ({
          url: Parser.parseURL(store.settings, action.payload),
          data: store.data}
        ))
        .switchMap(payload => this.fetchDataService.fetchData(
          payload.url, payload.data
        ))
        .map(result => new data.UpdateSignatureAction(
          result.data.result.toString().replace(/,/g , ' ')
        ));

      @Effect() getSignatureSuccess$ = this.actions$
        .ofType(server.ServerActionTypes.GET_SIGNATURE_SUCCESS)
        .map(action => action.payload)
        .switchMap(payload => Observable.of(
            new server.GetSimilaritiesAction(ApiEndpoints.zhang))
        );

      @Effect() getSimilarities$ = this.actions$
        .ofType(server.ServerActionTypes.GET_SIMILARITIES)
        .withLatestFrom(this.store)
        .map(([action, store]) => ({
          url: Parser.parseURL(store.settings, action.payload),
          data: store.data}
        ))
        .switchMap(payload => this.fetchDataService.fetchData(
          payload.url, payload.data
        ))
        .map(result => new server.GetSimilaritiesSuccessAction(
          this.handleDataService.setData(
            result.data, result.type)
        ));

      @Effect() getSimilaritiesSuccess1$ = this.actions$
        .ofType(server.ServerActionTypes.GET_SIMILARITIES_SUCCESS)
        .map(action => action.payload)
        .switchMap(payload => Observable.of(
            new server.GetSimilaritiesHistogramAction(
                ApiEndpoints.targetHistogram))
        );

      @Effect() getSimilaritiesSuccess2$ = this.actions$
        .ofType(server.ServerActionTypes.GET_SIMILARITIES_SUCCESS)
        .map(action => action.payload)
        .switchMap(payload => Observable.of(
            new server.GetKnownTargetsAction(ApiEndpoints.targetFrequency))
        );

      @Effect() getSimilaritiesSuccess3$ = this.actions$
        .ofType(server.ServerActionTypes.GET_SIMILARITIES_SUCCESS)
        .map(action => action.payload)
        .switchMap(payload => Observable.of(
            new server.GetAnnotatedPlatewellidsAction(
                ApiEndpoints.annotatedPlateWellids))
        );

      @Effect() getAnnotatedPlatewellids$ = this.actions$
        .ofType(server.ServerActionTypes.GET_ANNOTADED_PLATEWELLIDS)
        .withLatestFrom(this.store)
        .map(([action, store]) => ({
          url: Parser.parseURL(store.settings, action.payload),
          data: {'storeData': store.data,
                 'zhang': this.handleDataService.getData(ApiEndpoints.zhang)}}
        ))
        .switchMap(payload => this.fetchDataService.fetchData(
          payload.url, payload.data
        ))
        .map(result => new server.GetAnnotatedPlatewellidsSuccessAction(
          this.handleDataService.setData(
            result.data, result.type)
        ));

      @Effect() getSimilaritiesHist$ = this.actions$
        .ofType(server.ServerActionTypes.GET_SIMILARITIES_HISTOGRAM)
        .withLatestFrom(this.store)
        .map(([action, store]) => ({
          url: Parser.parseURL(store.settings, action.payload),
          data: {'storeData': store.data, 'bins': store.settings.histogramBins,
                 'zhang': this.handleDataService.getData(ApiEndpoints.zhang)}}
        ))
        .switchMap(payload => this.fetchDataService.fetchData(
          payload.url, payload.data
        ))
        .map(result => new server.GetSimilaritiesHistogramSuccessAction(
          this.handleDataService.setData(
            result.data, result.type)
        ));

      @Effect() getKnownTargets$ = this.actions$
        .ofType(server.ServerActionTypes.GET_KNOWN_TARGETS)
        .withLatestFrom(this.store)
        .map(([action, store]) => ({
          url: Parser.parseURL(store.settings, action.payload),
          data: this.handleDataService.getData(ApiEndpoints.zhang)}
        ))
        .switchMap(payload => this.fetchDataService.fetchData(
          payload.url, payload.data
        ))
        .map(result => new server.GetKnownTargetsSuccessAction(
          this.handleDataService.setData(
            result.data, result.type)
        ));
}
