import { loggerFactory } from '~/../../src/js/utils/logger'
import xs from 'xstream'
import { keys, values, filter, head, equals, map, prop, clone, omit, merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'
import { i, em, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody, h3, h4 } from '@cycle/dom';
import { titleCase } from '../utils/utils'
import sampleCombine from 'xstream/extra/sampleCombine'

/**
 * This components checks if an elements is clicked and shows a modal when so.
 * 
 * Please note:
 *  - No isolation is performed, but make sure the appropriate config key is pushed through!
 */
function CompoundAnnotation(sources, id = ".compoundPopup") {

    const logger = loggerFactory('compoundAnnotation', sources.onion.state$, 'settings.compoundAnnotations.debug')
    const state$ = sources.onion.state$

    const trigger$ = sources.DOM.select(id).events('click').map(x => x.target.textContent)

    const triggerAnnotation$ = trigger$.compose(sampleCombine(state$))
        .map(([el, state]) => {
            const url = state.settings.compoundAnnotations.url
            // v1 doesn't actually have a version identifier
            const version = (state.settings.compoundAnnotations.version == "v1") ? "" : "v2/"
            return {
                url: url + version + 'jnjs' + '/' + el,
                method: 'GET',
                'category': 'compound'
            }
        })

    const response$ = sources.HTTP
        .select('compound')
        .map((response$) =>
            response$.replaceError(() => xs.of({ body: { jnjs : 'NA'} }))
        )
        .flatten()
        .map(r => r.body)
        .debug()

    const displayAnnotationV1 = (annotation) => {
      return [
                    div('.grey-text.col.l6.s12',  [
                        h4('.grey-text.text-lighten-2', [titleCase(annotation.name)]),
                        p([b('.grey-text.text-lighten-1', "JNJS: "), annotation.jnjs]), 
                        p([b('.grey-text.text-lighten-1', "Accn: "), annotation.Accn]),
                        // p([b('.grey-text.text-lighten-1', "ProbesetID: "), annotation.probesetID]),
                        // p([b('.grey-text.text-lighten-1', "Ensembl: "),annotation.ensembl]),
                        // p([b('.grey-text.text-lighten-1', "Synonyms: "), annotation.synonyms]),
                        // p([b('.grey-text.text-lighten-1', "Link: "), a({ props: { href: annotation.uniprot, target: "_blank" } }, annotation.uniprot)]),
                    ]),
                    div('.col .l6.s12', [
                        // h4('.grey-text.text-darken-2', 'Target Information'),
                        p([b('.grey-text.text-lighten-1', 'Mechanism of Action: '), (annotation.drugBankMechanismOfAction != null) ? annotation.drugBankMechanismOfAction : "N/A"]),
                        p([b('.grey-text.text-lighten-1', 'Target Gene Name: '), (annotation.drugBankTargetGeneName != null) ? annotation.drugBankTargetGeneName : "N/A"]),
                        // p([b('.grey-text.text-lighten-1', 'Remarks: '), (annotation.remarks != null) ? annotation.remarks : "N/A"])
                    ])
                ]
    }

    const displayAnnotationV2 = (annotation) => {
      return [
                    div('.grey-text.col.l6.s12',  [
                        h4('.grey-text.text-lighten-2', [titleCase("Nothing yet !!!")]),
                    ])
                ]
    }

    const vdom$ = response$.map(annotation => {
        const isAvailable = (annotation.jnjs != "NA")
        if (isAvailable) {
            return div('#modal-' + annotation.jnjs + '.modal.bottom-sheet.grey.darken-4.grey-text', [
                div('.col.s12.modal-content', 
                  (annotation.version == "v1") ? displayAnnotationV1(annotation) : displayAnnotationV2(annotation))
            ])
        } else {
            return div('#modal-' + annotation.jnjs + '.modal.bottom-sheet.grey.darken-4.grey-text', [
                div('.col.s12.modal-content', [
                    div('.grey-text.col.l12.s12',  [
                        h4('.grey-text.text-lighten-2', [titleCase('No annotations available for this compound')]),
                    ]),
                ])
            ]) 
        }
    }).startWith(div())

    const openModal$ = response$
        .map(annotation => ({ el: '#modal-' + annotation.jnjs, state: 'open' }))

    return {
        log: xs.merge(
            logger(state$, 'state$')
        ),
        DOM: vdom$,
        HTTP: triggerAnnotation$,
        modal: xs.merge(openModal$)
    }

}

export { CompoundAnnotation }
