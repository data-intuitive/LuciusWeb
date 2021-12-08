import { loggerFactory } from '../utils/logger'
import xs from 'xstream'
import { keys, values, filter, head, equals, map, prop, clone, omit, merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'
import { i, em, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody, h3, h4 } from '@cycle/dom';
import { titleCase } from '../utils/utils'
import sampleCombine from 'xstream/extra/sampleCombine'
import delay from 'xstream/extra/delay'

/**
 * This components checks if an elements is clicked and shows a modal when so.
 * 
 * Please note:
 *  - No isolation is performed, but make sure the appropriate config key is pushed through!
 */
function TreatmentAnnotation(sources, id = ".treatmentPopup") {

  const logger = loggerFactory('treatmentAnnotation', sources.onion.state$, 'settings.treatmentAnnotations.debug')
  const state$ = sources.onion.state$

  const trigger$ =
    sources.DOM
      .select(id)
      .events('click')
      .map(x => x.target.textContent)
      // .startWith("BRD-K28907958")
      // .compose(delay(1000))

  const triggerAnnotation$ =
    trigger$
      .compose(sampleCombine(state$))
      .map(([el, state]) => {
        const url = state.settings.treatmentAnnotations.url
        return {
          url: url + 'id' + '/' + el,
          method: 'GET',
          'category': 'treatment'
        }
      })

  const response$ = sources.HTTP
    .select('treatment')
    .map((response$) =>
      response$.replaceError(() => xs.of({ body: { id: 'NA'} }))
    )
    .flatten()
    .map(r => r.body)

  const showEntry = (title, content) =>
        span('.s12.col', [b('.grey-text.text-lighten-1', title + ": "), (content != null && content != "") ? content : "N/A" ])

  const showEntryTabbed = (title, content) =>
        span('.row', [
          span('.col.l3', [ b('.grey-text.text-lighten-1', title) ]),
          span('.col.l9', [ content ])
        ])

  // Display code for TreatmentAnnotation in Brutus
  const displayAnnotation = (annotation) => {
    const title = annotation.name
    const targets = annotation.targetGenes
    // TODO reinstate targetActions as well
    // const targetActions = annotation.targetName
    // const targetResults = (targets.join() != "") ? targetActions.map((action, i) => action + " - " + targets[i])
    //                                         : ["No information available"]
    const targetResults = targets

    const externalIDs = annotation.externalID

    const idDom = externalIDs.map(id =>
        span('.row', [
          span('.col.l3', [ b('.grey-text.text-lighten-1', id.source) ]),
          span('.col.l9', [
            id.id,
            " ",
            (id.link.includes("https"))
            ? a('.grey-text',
                { props: { href: id.link, target: "_blank" } },
                i('.material-icons', { style: { fontSize: '16px', fontColor: 'gray' } }, 'link') )
            : ""
          ])
        ]),
    )

    return [
      div('.grey-text.col.l12.s12',
        [ h4('.grey-text.text-lighten-2', titleCase(title)) ]),
      div('.l6.s12.col',
        idDom.concat(
        showEntryTabbed("Clinical Phase", annotation.clinicalPhase),
        )
      ),
      div('.l6.s12.col', [
        // p([b('.grey-text.text-lighten-1', "Drugbank Search Field: "), (annotation.searchField != null) ? annotation.searchField : "N/A"]),
        showEntry("Mechanism of Action", titleCase(annotation.mechanismOfAction)),
        showEntry("Indication", titleCase(annotation.indication.join(", "))),
        showEntry("Therapeutic Group", titleCase(annotation.therapeuticGroup.join(", "))),
        span('.col.s12', {style: {'margin-block-end': '0px'}}, [b('.grey-text.text-lighten-1', "Targets: ")]),
        ul('.col.s12', {style: {'margin-block-start': '0px'}}, targetResults.map(item => li("- " + item))),
      ])
    ]
  }

  const vdom$ = response$.map(annotation => {
    const isAvailable = (annotation.id != "NA")
    if (isAvailable) {
      return div('#modal-' + annotation.id + '.modal.bottom-sheet.grey.darken-4.grey-text.row', [
        div('.col.s12.modal-content', displayAnnotation(annotation) )
      ])
    } else {
      return div('#modal-' + annotation.id + '.modal.bottom-sheet.grey.darken-4.grey-text.row', [
        div('.col.s12.modal-content', [
          div('.grey-text.col.l12.s12',  [
            h4('.grey-text.text-lighten-2', [ titleCase('No annotations available for this treatment') ]),
          ]),
        ])
      ])
    }
  }).startWith(div())

  const openModal$ = response$
    .map(annotation => ({ el: '#modal-' + annotation.id, state: 'open' }))

  return {
    log: xs.merge(
      logger(state$, 'state$')
    ),
    DOM: vdom$,
    HTTP: triggerAnnotation$,
    modal: openModal$
  }

}

export { TreatmentAnnotation }
