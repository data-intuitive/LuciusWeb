import xs from 'xstream';
import vg  from 'vega';
import {Observable} from 'rx';
import convert from 'stream-conversions';
import {log} from './utils/logger'

function makeVegaDriver() {

  function vegaDriver(spec$) {

    const view$$ = spec$.map(
        (obj) => {

            const vegaParseSpec = Observable.fromCallback(vg.parse.spec)
            const parsed = vegaParseSpec(obj.spec);
            const parsed$ = convert.rx.to.xstream(parsed);

            const view$ = parsed$.map(chart => chart({el:obj.el}).width(obj.width).height(350).update());

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

  }

  // We return the actual driver from our factory.
  return vegaDriver
}

export {makeVegaDriver};