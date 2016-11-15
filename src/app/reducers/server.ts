import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ServerActionTypes } from '../actions/server';

// the settings object, as saved inside the store
export interface State {
  signatureReady: boolean;
  compoundReady: boolean;
  zhangReady: boolean;
  similaritiesHistReady: boolean;
  knownTargetsReady: boolean;
  annotatedPlatewellidsReady: boolean;
}

const initialState: State = {
  signatureReady: false,
  compoundReady: false,
  zhangReady: false,
  similaritiesHistReady: false,
  knownTargetsReady: false,
  annotatedPlatewellidsReady: false
};

export function reducer(state = initialState, action: Action) {

  switch (action.type) {

    case ServerActionTypes.GET_COMPOUNDS_BY_JNJ: {
          return Object.assign({}, state, {compoundReady: false});
      }

    case ServerActionTypes.GET_COMPOUNDS_BY_JNJ_SUCCESS: {
          return Object.assign({}, state, {compoundReady: true});
      }

    case ServerActionTypes.GET_SIGNATURE: {
          return Object.assign({}, state, {signatureReady: false});
      }

    case ServerActionTypes.GET_SIGNATURE_SUCCESS: {
          return Object.assign({}, state, {signatureReady: true});
      }

    case ServerActionTypes.GET_SIMILARITIES: {
          return Object.assign({}, state, {zhangReady: false});
      }

    case ServerActionTypes.GET_SIMILARITIES_SUCCESS: {
          return Object.assign({}, state, {zhangReady: true});
      }

    case ServerActionTypes.GET_SIMILARITIES_HISTOGRAM: {
          return Object.assign({}, state, {similaritiesHistReady: false});
      }

    case ServerActionTypes.GET_SIMILARITIES_HISTOGRAM_SUCCESS: {
          return Object.assign({}, state, {similaritiesHistReady: true});
      }

    case ServerActionTypes.GET_KNOWN_TARGETS: {
          return Object.assign({}, state, {knownTargetsReady: false});
      }

    case ServerActionTypes.GET_KNOWN_TARGETS_SUCCESS: {
          return Object.assign({}, state, {knownTargetsReady: true});
      }

    case ServerActionTypes.GET_ANNOTADED_PLATEWELLIDS: {
          return Object.assign({}, state, {annotatedPlatewellidsReady: false});
      }

    case ServerActionTypes.GET_ANNOTADED_PLATEWELLIDS_SUCCESS: {
          return Object.assign({}, state, {annotatedPlatewellidsReady: true});
      }

    default: {
      return state;
    }
  }
}

export function getSignatureReady(state$: Observable<State>) {
  return state$.select(state => state.signatureReady);
}

export function getCompoundReady(state$: Observable<State>) {
  return state$.select(state => state.compoundReady);
}

export function getZhangReady(state$: Observable<State>) {
  return state$.select(state => state.zhangReady);
}

export function getSimilaritiesHistReady(state$: Observable<State>) {
  return state$.select(state => state.similaritiesHistReady);
}

export function getKnownTargetsReady(state$: Observable<State>) {
  return state$.select(state => state.knownTargetsReady);
}

export function getAnnotatedPlatewellidsReady(state$: Observable<State>) {
  return state$.select(state => state.annotatedPlatewellidsReady);
}
