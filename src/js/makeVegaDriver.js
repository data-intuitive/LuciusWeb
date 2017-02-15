import xs from 'xstream';
import vg  from 'vega';
import {Observable} from 'rx';
import convert from 'stream-conversions';

// utility function
const log = (x) => console.log(x);

function makeVegaDriver(container) {

  function vegaDriver(spec$) {

    const view$$ = spec$.map(
        (spec) => {

            const vegaParseSpec = Observable.fromCallback(vg.parse.spec)
            const parsed = vegaParseSpec(spec);
            const parsed$ = convert.rx.to.xstream(parsed);

            const view$ = parsed$.map(chart => chart({el:container}).update());

            return view$;
        }
    );

    const view$ = view$$.flatten();

   view$.addListener({
            next: () => {},
            error: () => {},
            complete: () => {}            
        });

    const clicks$$ = view$.map(view => {
        const click$ = xs.create({
            start: (listener) => {
                view.on('click', function(event, item) {
                    listener.next(item);
                }
            )},
            stop: () => {}
        });

        return click$;
    });

    const click$ = clicks$$.flatten();

    // For debugging:
    // click$.addListener({
    //         next: (el) => {log(el)},
    //         error: () => {},
    //         complete: () => {}            
    //     });

    return click$;
    // return xs.of({test:1});

  }

  // We return the actual driver from our factory.
  return vegaDriver
}

export {makeVegaDriver};