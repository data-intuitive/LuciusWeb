import '@ngrx/core/add/operator/select';
import { Observable } from 'rxjs/Observable';
import { ChartActions, ChartActionTypes } from '../actions/charts';

export interface State {
  targetGene: string;
  geneData: Array<number>;
  dataBounds: Array<number>;
  filter: boolean;
}

const initialState: State = {
  targetGene: '',
  geneData: [],
  dataBounds: [-1, 1],
  filter: false,
};

export function reducer(state = initialState, action: ChartActions): State {
  switch (action.type) {

    case ChartActionTypes.UPDATE_TARGET_GENE: {
        return Object.assign({}, state, {compound: action.payload});
    }

    case ChartActionTypes.UPDATE_GENE_DATA: {
        return Object.assign({}, state, {signature: action.payload});
    }

    case ChartActionTypes.UPDATE_DATA_BOUNDS: {
        return Object.assign({}, state, {signature: action.payload});
    }

    case ChartActionTypes.UPDATE_FILTER: {
        return Object.assign({}, state, {signature: action.payload});
    }

    default:
      return state;
  }
}

export function getTargetGene(state$: Observable<State>) {
  return state$.select(state => state.targetGene);
}

export function getGeneData(state$: Observable<State>) {
  return state$.select(state => state.geneData);
}

export function getDataBounds(state$: Observable<State>) {
  return state$.select(state => state.dataBounds);
}

export function getFilter(state$: Observable<State>) {
  return state$.select(state => state.filter);
}
