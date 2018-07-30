import { loggerFactory } from '~/../../src/js/utils/logger'
import xs from 'xstream'
import { keys, values, filter, head, equals, map, prop, clone, omit, merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'

// const GeneAnnotationQueryLens = {
//     get: state => ({ settings: state.settings.geneAnnotations }),
//     set: (state, childState) => state
// };

/**
 * This compontent checks if the mouse is over a DOM element with a gene identifier (tagged `.genePupop`).
 * It queries annotations for that gene and returns a json structure with the result to `output`.
 * 
 * Please note:
 *  - This component that does NOT handle DOM rendering of the annotations!
 *  - No isolation is performed, but make sure the appropriate config key is pushed through!
 */
function GeneAnnotationQuery(sources, id = ".genePopup") {

    const logger = loggerFactory('geneAnnotationsQuery', sources.onion.state$, 'settings.debug')
    const state$ = sources.onion.state$.debug()

    /**
     * check if the mouse is over a certain element
     */
    const mouseIn$ = sources.DOM.select(id).events('mouseenter', {
        preventDefault: true
    }).map(x => x.target.textContent)

    const mouseOut$ = sources.DOM.select(id).events('mouseleave', {
        preventDefault: true,
        useCapture: true
    }).mapTo("")

    const hover$ = xs.merge(mouseIn$, mouseOut$).startWith("")

    const cleanURL = (url) => url.replace('-', '').trim()

    const triggerGeneAnnotation$ = xs.combine(hover$, state$.compose(dropRepeats(equals)))
        .filter(([el, state]) => el != "")
        .map(([el, state]) => {
            return {
                url: cleanURL(state.settings.geneAnnotations.url + el),
                method: 'GET',
                'category': 'gene'
            }
        })
        .remember()
        .debug()

    const geneResponse$ = sources.HTTP
        .select('gene')
        .map((response$) =>
            response$.replaceError(() => xs.of({ body: {} }))
        )
        .flatten()
        .map(r => r.body)
        .debug()

    return {
        log: xs.merge(
            logger(state$, 'state$'),
        ),
        hover: hover$,
        output: geneResponse$.startWith({}),
        HTTP: triggerGeneAnnotation$
    }

}

export { GeneAnnotationQuery }