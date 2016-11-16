import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as server from '../actions/server';
import * as fromRoot from '../reducers';
import * as data from '../actions/data';
import * as services from '../services';

import { Parser } from '../shared/parser';
import { APIEndpoints } from '../shared/api-endpoints';

@Injectable()
export class ServerEffects {
  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private handleDataService: services.HandleDataService,
    private compoundDataService: services.CompoundDataService,
    private signatureDataService: services.SignatureDataService,
    private zhangDataService: services.ZhangDataService,
    private annotatedPlateWellidsDataService: services.AnnotatedPlateWellIdsDataService,
    private targetFrequencyDataService: services.TargetFrequencyDataService,
    private targetHistogramDataService: services.TargetHistogramDataService,
  ) {
  }

    @Effect() getCompoundsByJNJ$ = this.actions$
      .ofType(server.ServerActionTypes.GET_COMPOUNDS_BY_JNJ)
      .withLatestFrom(this.store)
      .map(([action, store]) => ({
        url: Parser.parseURL(store.settings, action.payload),
        data: store.data.compound}
      ))
      .switchMap(payload => this.compoundDataService.fetchData(
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
        .switchMap(payload => this.signatureDataService.fetchData(
          payload.url, payload.data
        ))
        .map(result => new data.UpdateSignatureAction(
          result.data.toString().replace(/,/g , ' ')
        ));

      @Effect() getSignatureSuccess$ = this.actions$
        .ofType(server.ServerActionTypes.GET_SIGNATURE_SUCCESS)
        .map(action => action.payload)
        .switchMap(payload => Observable.of(
            new server.GetSimilaritiesAction(APIEndpoints.zhang))
        );

      @Effect() getSimilarities$ = this.actions$
        .ofType(server.ServerActionTypes.GET_SIMILARITIES)
        .withLatestFrom(this.store)
        .map(([action, store]) => ({
          url: Parser.parseURL(store.settings, action.payload),
          data: store.data}
        ))
        .switchMap(payload => this.zhangDataService.fetchData(
          payload.url, payload.data
        ))
        .map(result => new server.GetSimilaritiesSuccessAction(
          this.handleDataService.setData(
            result.data, result.type)
        ));

      // TODO: combine these 3 effects into one
      @Effect() getSimilaritiesSuccess1$ = this.actions$
        .ofType(server.ServerActionTypes.GET_SIMILARITIES_SUCCESS)
        .map(action => action.payload)
        .switchMap(payload => Observable.from([
            new server.GetSimilaritiesHistogramAction(
                APIEndpoints.targetHistogram),
            new server.GetKnownTargetsAction(
                  APIEndpoints.targetFrequency),
            new server.GetAnnotatedPlatewellidsAction(
                APIEndpoints.annotatedPlateWellids)
            ])
        );

      @Effect() getAnnotatedPlatewellids$ = this.actions$
        .ofType(server.ServerActionTypes.GET_ANNOTADED_PLATEWELLIDS)
        .withLatestFrom(this.store)
        .map(([action, store]) => ({
          url: Parser.parseURL(store.settings, action.payload),
          data: {'storeData': store.data,
                 'zhang': this.handleDataService.getData(APIEndpoints.zhang)}}
        ))
        .switchMap(payload => this.annotatedPlateWellidsDataService.fetchData(
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
                 'zhang': this.handleDataService.getData(APIEndpoints.zhang)}}
        ))
        .switchMap(payload => this.targetHistogramDataService.fetchData(
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
          data: this.handleDataService.getData(APIEndpoints.zhang)}
        ))
        .switchMap(payload => this.targetFrequencyDataService.fetchData(
          payload.url, payload.data
        ))
        .map(result => new server.GetKnownTargetsSuccessAction(
          this.handleDataService.setData(
            result.data, result.type)
        ));
}
