import { Action } from '@ngrx/store';

export const ServerActionTypes = {
  GET_COMPOUNDS_BY_JNJ: '[Server] Get Compounds by JNJ',
  GET_COMPOUNDS_BY_JNJ_SUCCESS: '[Server] Get Compounds by JNJ Sucess',
  GET_SIGNATURE: '[Server] Get Signature',
  GET_SIGNATURE_SUCCESS: '[Server] Get Signature Success',
  GET_SIMILARITIES: '[Server] Get Similarities',
  GET_SIMILARITIES_SUCCESS: '[Server] Get Similarities Success',
  GET_SIMILARITIES_HISTOGRAM: '[Server] Get Similarities Histogram',
  GET_SIMILARITIES_HISTOGRAM_SUCCESS: '[Server] Get Similarities Histogram Success',
  GET_KNOWN_TARGETS: '[Server] Get Known Targets',
  GET_KNOWN_TARGETS_SUCCESS: '[Server] Get Known Targets Success',
  GET_ANNOTADED_PLATEWELLIDS: '[Server] Get Annotated Platewellids',
  GET_ANNOTADED_PLATEWELLIDS_SUCCESS: '[Server] Get Annotated Platewellids Success',
  GET_BINNED_ZHANG: '[Server] Get Binned Zhang',
  GET_BINNED_ZHANG_SUCCESS: '[Server] Get Binned Zhang Success'
};

export class GetCompoundsByJNJAction implements Action {
  type = ServerActionTypes.GET_COMPOUNDS_BY_JNJ;

  constructor(public payload: string) {
  }
}

export class GetCompoundsByJNJSuccessAction implements Action {
  type = ServerActionTypes.GET_COMPOUNDS_BY_JNJ_SUCCESS;

  constructor(public payload: string) {
  }
}

export class GetSignatureAction implements Action {
    type = ServerActionTypes.GET_SIGNATURE;

    constructor(public payload: string) {
    }
}

export class GetSignatureSuccessAction implements Action {
    type = ServerActionTypes.GET_SIGNATURE_SUCCESS;

    constructor(public payload: string) {
    }
  }

export class GetSimilaritiesAction implements Action {
    type = ServerActionTypes.GET_SIMILARITIES;

    constructor(public payload: string) {
    }
}

export class GetSimilaritiesSuccessAction implements Action {
    type = ServerActionTypes.GET_SIMILARITIES_SUCCESS;

    constructor(public payload: string) {
    }
  }

export class GetSimilaritiesHistogramAction implements Action {
    type = ServerActionTypes.GET_SIMILARITIES_HISTOGRAM;

    constructor(public payload: string) {
    }
}

export class GetSimilaritiesHistogramSuccessAction implements Action {
    type = ServerActionTypes.GET_SIMILARITIES_HISTOGRAM_SUCCESS;

    constructor(public payload: string) {
    }
  }

export class GetKnownTargetsAction implements Action {
    type = ServerActionTypes.GET_KNOWN_TARGETS;

    constructor(public payload: string) {
    }
}

export class GetKnownTargetsSuccessAction implements Action {
    type = ServerActionTypes.GET_KNOWN_TARGETS_SUCCESS;

    constructor(public payload: string) {
    }
  }

  export class GetAnnotatedPlatewellidsAction implements Action {
      type = ServerActionTypes.GET_ANNOTADED_PLATEWELLIDS;

      constructor(public payload: string) {
      }
  }

  export class GetAnnotatedPlatewellidsSuccessAction implements Action {
      type = ServerActionTypes.GET_ANNOTADED_PLATEWELLIDS_SUCCESS;

      constructor(public payload: string) {
      }
    }

    export class GetBinnedZhangAction implements Action {
        type = ServerActionTypes.GET_BINNED_ZHANG;

        constructor(public payload: string) {
        }
      }

    export class GetBinnedZhangSuccessAction implements Action {
        type = ServerActionTypes.GET_BINNED_ZHANG_SUCCESS;

        constructor(public payload: string) {
        }
      }

export type SettingsActions =
    GetCompoundsByJNJAction
  | GetCompoundsByJNJSuccessAction
  | GetSignatureAction
  | GetSignatureSuccessAction
  | GetSimilaritiesAction
  | GetSimilaritiesSuccessAction
  | GetSimilaritiesHistogramAction
  | GetSimilaritiesHistogramSuccessAction
  | GetKnownTargetsAction
  | GetKnownTargetsSuccessAction
  | GetAnnotatedPlatewellidsAction
  | GetAnnotatedPlatewellidsSuccessAction
  | GetBinnedZhangAction
  | GetBinnedZhangSuccessAction
