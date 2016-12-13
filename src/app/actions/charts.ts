import { Action } from '@ngrx/store';

export const ChartActionTypes = {
  UPDATE_TARGET_GENE: '[Charts] Update Target Gene',
  UPDATE_GENE_DATA: '[Charts] Update Gene Data',
  UPDATE_DATA_BOUNDS: '[Charts] Update DataBounds',
  UPDATE_FILTER: '[Charts] Update Filter',
};

export class UpdateTargetGeneAction implements Action {
  type = ChartActionTypes.UPDATE_TARGET_GENE;

  constructor(public payload: string) {
  }
}

export class UpdateGeneDataAction implements Action {
  type = ChartActionTypes.UPDATE_GENE_DATA;

  constructor(public payload: Array<string>) {
  }
}

export class UpdateDataBoundsAction implements Action {
  type = ChartActionTypes.UPDATE_DATA_BOUNDS;

  constructor(public payload: Array<number>) {
  }
}

export class UpdateFilterAction implements Action {
  type = ChartActionTypes.UPDATE_FILTER;

  constructor(public payload: boolean) {
  }
}

export type ChartActions =
  UpdateGeneDataAction | UpdateGeneDataAction |
  UpdateDataBoundsAction | UpdateFilterAction
