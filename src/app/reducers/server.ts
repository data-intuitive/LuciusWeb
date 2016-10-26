import '@ngrx/core/add/operator/select';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ServerActionTypes } from '../actions/server';

// the settings object, as saved inside the store
export interface State {
  signatureFetched: boolean;
  compoundFetched: boolean;
  zhangFetched: boolean;
  similaritiesHistFetched: boolean;
  knownTargetsFetched: boolean;
  annotatedPlatewellidsFetched: boolean;
}

const initialState: State = {
  signatureFetched: false,
  compoundFetched: false,
  zhangFetched: false,
  similaritiesHistFetched: false,
  knownTargetsFetched: false,
  annotatedPlatewellidsFetched: false
};

export function reducer(state = initialState, action: Action) {

  switch (action.type) {

    case ServerActionTypes.GET_COMPOUNDS_BY_JNJ: {
          return Object.assign({}, state, {compoundFetched: false});
      }

    case ServerActionTypes.GET_COMPOUNDS_BY_JNJ_SUCCESS: {
          return Object.assign({}, state, {compoundFetched: true});
      }

    case ServerActionTypes.GET_SIGNATURE: {
          return Object.assign({}, state, {signatureFetched: false});
      }

    case ServerActionTypes.GET_SIGNATURE_SUCCESS: {
          return Object.assign({}, state, {signatureFetched: true});
      }

    case ServerActionTypes.GET_SIMILARITIES: {
          return Object.assign({}, state, {zhangFetched: false});
      }

    case ServerActionTypes.GET_SIMILARITIES_SUCCESS: {
          return Object.assign({}, state, {zhangFetched: true});
      }

    case ServerActionTypes.GET_SIMILARITIES_HISTOGRAM: {
          return Object.assign({}, state, {similaritiesHistFetched: false});
      }

    case ServerActionTypes.GET_SIMILARITIES_HISTOGRAM_SUCCESS: {
          return Object.assign({}, state, {similaritiesHistFetched: true});
      }

    case ServerActionTypes.GET_KNOWN_TARGETS: {
          return Object.assign({}, state, {knownTargetsFetched: false});
      }

    case ServerActionTypes.GET_KNOWN_TARGETS_SUCCESS: {
          return Object.assign({}, state, {knownTargetsFetched: true});
      }

    case ServerActionTypes.GET_ANNOTADED_PLATEWELLIDS: {
          return Object.assign({}, state, {annotatedPlatewellidsFetched: false});
      }

    case ServerActionTypes.GET_ANNOTADED_PLATEWELLIDS_SUCCESS: {
          return Object.assign({}, state, {annotatedPlatewellidsFetched: true});
      }

    default: {
      return state;
    }
  }
}

export function getSignatureFetched(state$: Observable<State>) {
  return state$.select(state => state.signatureFetched);
}

export function getCompoundFetched(state$: Observable<State>) {
  return state$.select(state => state.compoundFetched);
}

export function getZhangFetched(state$: Observable<State>) {
  return state$.select(state => state.zhangFetched);
}

export function getSimilaritiesHistFetched(state$: Observable<State>) {
  return state$.select(state => state.similaritiesHistFetched);
}

export function getKnownTargetsFetched(state$: Observable<State>) {
  return state$.select(state => state.knownTargetsFetched);
}

export function getAnnotatedPlatewellidsFetched(state$: Observable<State>) {
  return state$.select(state => state.annotatedPlatewellidsFetched);
}
