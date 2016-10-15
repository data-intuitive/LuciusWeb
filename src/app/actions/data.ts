import { Action } from '@ngrx/store';

export const DataActionTypes = {
  SAVED: '[Data] Saved',
  NOT_SAVED: '[Data] Not Saved',
  UPDATE_COMPOUND: '[Data] Update Compound',
  UPDATE_SIGNATURE: '[Data] Update Signature',
};

export class SavedAction implements Action {
  type = DataActionTypes.SAVED;

  constructor(public payload: string) {}

}

export class NotSavedAction implements Action {
  type = DataActionTypes.NOT_SAVED;

  constructor(public payload: string) {}

}

export class UpdateCompoundAction implements Action {
  type = DataActionTypes.UPDATE_COMPOUND;

  constructor(public payload: string) {
  }
}

export class UpdateSignatureAction implements Action {
    type = DataActionTypes.UPDATE_SIGNATURE;

    constructor(public payload: string) {
    }
}

export type DataActions = SavedAction | NotSavedAction
                        | UpdateCompoundAction | UpdateSignatureAction
