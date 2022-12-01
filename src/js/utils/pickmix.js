import xs from "xstream"
var adapt_1 = require("@cycle/run/lib/adapt");
function mix(aggregator) {
  return function mixOperator(streamArray$) {
      return adapt_1.adapt(xs.fromObservable(streamArray$)
          .map(function (streamArray) { return aggregator.apply(void 0, streamArray); })
          .flatten());
  };
}

function pick(selector) {
  if (typeof selector === 'string') {
      return function pickWithString(sinksArray$) {
          return adapt_1.adapt(xs.fromObservable(sinksArray$)
              .map(function (sinksArray) { return sinksArray.map(function (sinks) { return sinks[selector]; }); }));
      };
  }
  else {
      return function pickWithFunction(sinksArray$) {
          return adapt_1.adapt(xs.fromObservable(sinksArray$)
              .map(function (sinksArray) { return sinksArray.map(selector); }));
      };
  }
}
export { mix, pick }