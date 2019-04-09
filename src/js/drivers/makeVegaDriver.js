import xs from 'xstream'
import { View } from 'vega-view'
import { Warn } from 'vega'
// import { parse } from 'vega-parser'

function makeVegaDriver() {

    function vegaDriver(spec$) {

        const view$ = spec$
            .map(specInfo => ({
                view: new View(specInfo.runtime).width(specInfo.width).height(specInfo.height).logLevel(Warn),
                el: specInfo.el
            }))

        view$.addListener({
            next: (viewInfo) => {
                viewInfo.view.initialize(viewInfo.el).hover().run()
                console.log('--> new view created')
            },
            error: (m) => {
                console.error(m)
            }
        })

    }

    return vegaDriver

}

export { makeVegaDriver };
