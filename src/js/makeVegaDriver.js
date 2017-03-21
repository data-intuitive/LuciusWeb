import xs from 'xstream';
import vg  from 'vega';

function makeVegaDriver() {

  function vegaDriver(spec$) {

    const view$$ = spec$.map(
        (obj) => {

            const parsed$ = xs.create({
                start: (listener) => {
                    vg.parse.spec(obj.spec, res => listener.next(res))
                }, 
                stop: () => {}
            })
            
            const view$ = parsed$.map(chart => chart({el:obj.el}).width(obj.width).height(350).update())

            const errorHandlingView$ = view$.replaceError(() => xs.empty())

            return errorHandlingView$

        }
    );

    const view$ = view$$.flatten();

    view$.addListener({
            next: (n) => {},
            error: (e) => {
                console.error('An error occured in the vegaDriver')
                console.error(e)
            },
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

    return click$;

  }

  // We return the actual driver from our factory.
  return vegaDriver
}

export {makeVegaDriver};