import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody, h3 } from '@cycle/dom';
import { clone, equals, merge, isEmpty } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import delay from 'xstream/extra/delay'
import { loggerFactory } from '../utils/logger'
import { stringify } from 'querystring';
import { GeneAnnotationQuery } from './GeneAnnotationQuery'
import { absGene } from '../utils/utils'
import { dirtyWrapperStream } from "../utils/ui"

const emptyData = {
    body: {
        result: {
            data: []
        }
    }
}

const signatureLens = {
    get: state => ({ core: state.form.signature, settings: state.settings,
        ui: (state.ui??{}).signature ?? {dirty: false}, // Get state.ui.signature in a safe way or else get a default
     }),
    set: (state, childState) => ({ ...state, form: { ...state.form, signature: childState.core } })
};

function model(newInput$, request$, data$) {

        // Initialization
        const defaultReducer$ = xs.of(prevState => ({ ...prevState, core: { input: '' } }))
        // Add input to state
        const inputReducer$ = newInput$.map(i => prevState => ({ ...prevState, core: { ...prevState.core, input: i } }))
        // Add request body to state
        const requestReducer$ = request$.map(req => prevState => ({ ...prevState, core: { ...prevState.core, request: req } }))
        // Add data from API to state, update output key when relevant
        const dataReducer$ = data$.map(newData => prevState => ({ ...prevState, core: { ...prevState.core, data: newData, output: newData.join(" ") } }))

    return xs.merge(
        defaultReducer$,
        inputReducer$,
        dataReducer$,
        requestReducer$
    )
}

function view(state$, request$, response$, geneAnnotationQuery) {

    const validSignature$ = response$
        .map(r => r.body.result.join(" "))
        .filter(s => s != '')

    const invalidSignature$ = response$
        .map(r => r.body.result.join(" "))
        .filter(s => s == '')

    const signature$ = xs.merge(validSignature$, invalidSignature$).remember()

    const geneStyle = {
        style: {
            'border-style': 'solid',
            'border-width': '1px',
            'margin': '2px 2px 2px 2px'
        }
    }

    const showGene = (thisGene) =>
    div('#' + absGene(thisGene) + '.col.orange.lighten-4.genePopup', geneStyle, [
        thisGene
    ])

    const validVdom$ = xs.combine(validSignature$, geneAnnotationQuery.DOM)
        .map(([s, annotation]) => div('.card .orange .lighten-3', [
            div('.card-content .orange-text .text-darken-4', [
                span('.card-title', 'Signature:'),
                div('.row', { style: { fontSize: "16px", fontStyle: 'bold' } },
                    s.split(" ").map(gene => showGene(gene))),
                annotation
            ])
        ]))
        .startWith(div('.card .orange .lighten-3', []))

    const invalidVdom$ = invalidSignature$
        .map(_ => div('.card .orange .lighten-3', [
            div('.card-content .red-text .text-darken-1', [
                div('.row', { style: { fontSize: "16px", fontStyle: 'bold' } }, [
                    p('.center', { style: { fontSize: "26px" } }, "The resulting signature is empty, please check the sample selection!")
                ])
            ])
        ]))
        .startWith(div('.card .orange .lighten-3', []))

    const loadingVdom$ = request$.compose(sampleCombine(state$))
        .mapTo(
        div('.card .orange .lighten-3', [
            div('.card-content .orange-text .text-darken-4', [
            span('.card-title', 'Signature:'),
            div('.progress.orange.lighten-3.yellow-text', { style: { margin: '2px 0px 2px 0px'} }, [
                div('.indeterminate', {style : { "background-color" : 'orange' }})
            ])
            ])
        ]))
        .startWith(div('.card .orange .lighten-3', []))
        .remember()

    // Wrap component vdom with an extra div that handles being dirty
    const vdom$ = dirtyWrapperStream( state$, xs.merge(loadingVdom$, invalidVdom$, validVdom$) )

    return {
        vdom$: vdom$,
        signature$: signature$
    }
}

//function intent() {}


/**
 * Generate a signature from a list of samples.
 *
 * Input: List of samples (array)
 * Output: Signature (can be empty!)
 *
 * Genes can be annotated (if Brutus is running). But the app is robust against Brutus not being online.
 *
 * TODO: A lot of cleanup and rework is still required:
 *
 * - Configure Brutus endpoint
 * - Isolate gene as a component
 */
function SignatureGenerator(sources) {

    // Plug-in annotations for genes
    const geneAnnotationQuery = GeneAnnotationQuery(sources)

    const logger = loggerFactory('signatureGenerator', sources.onion.state$, 'settings.form.debug')

    const state$ = sources.onion.state$

    const input$ = sources.input

    const newInput$ = xs.combine(
        input$,
        state$
    )
        .map(([newinput, state]) => ({ ...state, core: { ...state.core, input: newinput } }))
        .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

    const triggerRequest$ = newInput$

    const request$ = triggerRequest$
        .map(state => {
            return {
                url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.generateSignature',
                method: 'POST',
                send: {
                    version: 'v2',
                    samples: state.core.input.join(" "),
                    pvalue: state.settings.common.pvalue
                },
                'category': 'generateSignature'
            }
        })

    const response$ = sources.HTTP
        .select('generateSignature')
        .map((response$) =>
            response$.replaceError(() => xs.of(emptyData))
        )
        .flatten()

    const data$ = response$
        .map(r => r.body.result)

    const reducers$ = model(newInput$, request$, data$)

    const views = view(state$, request$, response$, geneAnnotationQuery)


    return {
        log: xs.merge(
            logger(state$, 'state$'),
            geneAnnotationQuery.log
        ),
        DOM: views.vdom$,
        output: views.signature$,
        HTTP: xs.merge(
            request$,
            geneAnnotationQuery.HTTP
        ),
        onion: reducers$,
        modal: geneAnnotationQuery.modal
    }

}

export { SignatureGenerator, signatureLens }
