import xs from 'xstream'
import { View } from 'vega-view'
import { Warn } from 'vega'

function makeVegaDriver() {

  function vegaDriver(spec$) {

    spec$.addListener({
        next: (spec) => new View(spec.runtime).width(spec.width).height(350).logLevel(Warn).renderer('canvas').initialize(spec.el).hover().run(),
    })

    // return result$

    // const view$$ = spec$.map(
    //     (obj) => {

    //         // const parsed$ = xs.create({
    //         //     start: (listener) => {
    //         //        vg.parse(obj.spec, res => listener.next(res))
    //         //     }, 
    //         //     stop: () => {}
    //         // })
            
    //         const view$ = parsed$.map(chart => vg.View({el:obj.el}).width(obj.width).height(350).update())

    //         const errorHandlingView$ = view$.replaceError(() => xs.empty())

    //         return errorHandlingView$

    //     }
    // );

    // const view$ = view$$.flatten();

    // const click$$ = view$.map(view => {

    //     const added$ = xs.create({
    //         start: (listener) => {
    //             view.on('click', function(event, item) {
    //                 listener.next({obj: view.el, data: item.datum});
    //             }
    //         )},
    //         stop: () => {}
    //     })

    //     return added$

    // });

    // const click$ = click$$.flatten()

    // view$.addListener({
    //     next: (n) => {},
    //     error: (e) => {
    //         console.error('An error occured in the vegaDriver')
    //         console.error(e)
    //     },
    //     complete: () => {}            
    // });

    // click$.addListener({
    //     next: (n) => {
    //         console.log(n)
    //     },
    //     error: (e) => {
    //         console.error('An error occured in the click stream')
    //         console.error(e)
    //     },
    //     complete: () => {}            
    // });

    // return click$;

  }

  // We return the actual driver from our factory.
  return vegaDriver
}

export {makeVegaDriver};