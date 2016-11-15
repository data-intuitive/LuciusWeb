export interface TargetHistogram {
  metadata: {
    bins: number;
    bounds: Array<Array<Number>>;
  };
  data: {
      zhang: Array<Number>;
      [name: string]: Array<Number>;
  };
};
