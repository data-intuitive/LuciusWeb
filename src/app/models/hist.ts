export interface HistData {
  result: {
    metadata: {
      bins: number;
      bounds: Array<Array<number>>;
    }
    data: any
  };
};
