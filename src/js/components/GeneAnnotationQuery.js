import { loggerFactory } from '../utils/logger'
import xs from 'xstream'
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

    const logger = loggerFactory('geneAnnotationQuery', sources.state.stream, 'settings.geneAnnotations.debug')
    const state$ = sources.state.stream

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
            response$.replaceError(() => xs.of({ body: {symbol: 'NA'} }))
        )
        .flatten()
        .map(r => r.body)

    const DOM$ = geneResponse$.map(annotation => {
        const isAvailable = (annotation.symbol != "NA")
        if (isAvailable) {
            return div('#modal-' + absGene(annotation.symbol) + '.modal.bottom-sheet.grey.darken-4.grey-text', [
                    div('.col.s12.modal-content', [
                        div('.grey-text.col.l6.s12',  [
                            h4('.grey-text.text-lighten-2', [titleCase(annotation.name)]),
                            p([b('.grey-text.text-lighten-1', "Protein: "), annotation.protein]), 
                            p([b('.grey-text.text-lighten-1', "EntrezID: "), annotation.entrezid]),
                            p([b('.grey-text.text-lighten-1', "ProbesetID: "), annotation.probesetID]),
                            p([b('.grey-text.text-lighten-1', "Ensembl: "),annotation.ensembl]),
                            p([b('.grey-text.text-lighten-1', "Synonyms: "), annotation.synonyms]),
                            p([b('.grey-text.text-lighten-1', "Link: "), a({ props: { href: annotation.uniprot, target: "_blank" } }, annotation.uniprot)]),
                        ]),
                        div('.col .l6.s12', [
                            // h4('.grey-text.text-darken-2', 'Target Information'),
                            p([b('.grey-text.text-lighten-1', 'Function: '), annotation.function]),
                            p([b('.grey-text.text-lighten-1', 'Involved in: '), (annotation.involved != null) ? annotation.involved : "N/A"]),
                            p([b('.grey-text.text-lighten-1', 'Remarks: '), (annotation.remarks != null) ? annotation.remarks : "N/A"])
                        ])
                    ])
                ])
        } else {
            return div('#modal-' + absGene(annotation.symbol) + '.modal.bottom-sheet.grey.darken-4.grey-text.row', [
                    div('.col.s12.modal-content', [
                        div('.grey-text.col.l12.s12',  [
                            h4('.grey-text.text-lighten-2', [ titleCase('No annotations available for this gene') ]),
                        ]),
                    ])
                ])
            }
    }).startWith(div())

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
