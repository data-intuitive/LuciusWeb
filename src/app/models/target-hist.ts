export interface TargetHist {
    result: {
      metadata: {
        bins: number,
        bounds: Array<Array<Number>>
    },
    data: {
      zhang: Array<Number>,
      [name: string]: Array<Number>
    }
  };
}
