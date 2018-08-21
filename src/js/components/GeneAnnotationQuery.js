import { loggerFactory } from '~/../../src/js/utils/logger'
import xs from 'xstream'
import { keys, values, filter, head, equals, map, prop, clone, omit, merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'
import { i, em, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody, h3, h4 } from '@cycle/dom';
import { absGene, titleCase } from '../utils/utils'
import sampleCombine from 'xstream/extra/sampleCombine'

/**
 * This components checks if an elements is clicked and shows a modal when so.
 * 
 * Please note:
 *  - No isolation is performed, but make sure the appropriate config key is pushed through!
 */
function GeneAnnotationQuery(sources, id = ".genePopup") {

    const logger = loggerFactory('geneAnnotationQuery', sources.onion.state$, 'settings.geneAnnotations.debug')
    const state$ = sources.onion.state$

    const trigger$ = sources.DOM.select(id).events('click').map(x => x.target.textContent)

    const triggerGeneAnnotation$ = trigger$.compose(sampleCombine(state$))
        .map(([el, state]) => {
            return {
                url: state.settings.geneAnnotations.url + absGene(el),
                method: 'GET',
                'category': 'gene'
            }
        })

    const geneResponse$ = sources.HTTP
        .select('gene')
        .map((response$) =>
            response$.replaceError(() => xs.of({ body: {} }))
        )
        .flatten()
        .map(r => r.body)

    const DOM$ = geneResponse$.map(annotation =>
        div('#modal-' + absGene(annotation.symbol) + '.modal.bottom-sheet.grey.darken-4.grey-text', [
            div('.col.s12.modal-content', [
                h3('.text-darken-3.right-align', 'Target Information'),
                div('.grey-text.text-lighten-2.col.s4', { style: { 'font-size': '14px', } }, [
                    h4([titleCase(annotation.name)]),
                    p([b("Link: "), a({ props: { href: annotation.uniprot, target: "_blank" } }, annotation.uniprot)]),
                    p([b("EntrezID: "), annotation.entrezid]),
                    p([b("Ensembl: "),annotation.ensembl])
                ]),
                div('.col .s8', [
                    p(annotation.function),
                ])
            ])
        ])
    ).startWith(div())

    const openModal$ = geneResponse$
        .map(annotation => ({ el: '#modal-' + annotation.symbol, state: 'open' }))

    return {
        log: xs.merge(
            logger(state$, 'state$')
        ),
        DOM: DOM$,
        HTTP: triggerGeneAnnotation$,
        modal: xs.merge(openModal$)
    }

}

export { GeneAnnotationQuery }