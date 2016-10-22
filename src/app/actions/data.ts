import { Action } from '@ngrx/store';

export const DataActionTypes = {
  UPDATE_COMPOUND: '[Data] Update Compound',
  UPDATE_SIGNATURE: '[Data] Update Signature'
};

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

export type DataActions = UpdateCompoundAction | UpdateSignatureAction
