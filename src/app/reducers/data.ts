import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';
import { DataActions, DataActionTypes } from '../actions/data';

export interface State {
  signatureSaved: boolean;
  compoundSaved: boolean;
  signature: string;
  compound: string;
}

const initialState: State = {
  signatureSaved: false,
  compoundSaved: false,
  signature: '',
  compound: ''
};

export function reducer(state = initialState, action: DataActions): State {
  switch (action.type) {
    case DataActionTypes.SAVED:
      switch (action.payload) {
        case 'compounds':
          return Object.assign({}, state, {compoundSaved: true});
        case 'signature':
          return Object.assign({}, state, {signatureSaved: true});
      }
    case DataActionTypes.NOT_SAVED:
      switch (action.payload) {
        case 'compounds':
          return Object.assign({}, state, {compoundSaved: false});
        case 'signature':
          return Object.assign({}, state, {signatureSaved: false});
      }
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

export function getSignatureSaved(state$: Observable<State>) {
  return state$.select(state => state.signatureSaved);
}

export function getCompoundSaved(state$: Observable<State>) {
  return state$.select(state => state.compoundSaved);
}

export function getSignature(state$: Observable<State>) {
  return state$.select(state => state.signature);
}

export function getCompound(state$: Observable<State>) {
  return state$.select(state => state.compound);
}
