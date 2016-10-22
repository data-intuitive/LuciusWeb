import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';
import { DataActions, DataActionTypes } from '../actions/data';

export interface State {
  signature: string;
  compound: string;
}

const initialState: State = {
  signature: 'HSPA1A DNAJB1 BAG3 P4HA2 HSPA8 TMEM97 SPR DDIT4 HMOX1 -TSEN2',
  compound: ''
};

export function reducer(state = initialState, action: DataActions): State {
  switch (action.type) {

    case DataActionTypes.UPDATE_COMPOUND: {
        return Object.assign({}, state, {compound: action.payload});
    }

    case DataActionTypes.UPDATE_SIGNATURE: {
        return Object.assign({}, state, {signature: action.payload});
    }

    default:
      return state;
  }
}

export function getSignature(state$: Observable<State>) {
  return state$.select(state => state.signature);
}

export function getCompound(state$: Observable<State>) {
  return state$.select(state => state.compound);
}
