export interface TargetHistogram {
  metadata: {
    bins: number;
    bounds: Array<Array<number>>;
  };
  data: {
      zhang: Array<number>;
      [name: string]: Array<number>;
  };
};
