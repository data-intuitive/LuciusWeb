import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody, h3 } from '@cycle/dom';
import { clone, equals, merge, isEmpty } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'
import { loggerFactory } from '~/../../src/js/utils/logger'
import { stringify } from 'querystring';
import { isNullOrUndefined } from 'util';
import { GeneAnnotationQuery } from './GeneAnnotationQuery'
// import { GeneAnnotationQueryLens } from './GeneAnnotationQuery'

const emptyData = {
    body: {
        result: {
            data: []
        }
    }
}

const signatureLens = {
    get: state => ({ core: state.form.signature, settings: state.settings }),
    set: (state, childState) => ({...state, form: {...state.form, signature: childState.core } })
};

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

    const logger = loggerFactory('signatureGenerator', sources.onion.state$, 'settings.form.debug')

    const state$ = sources.onion.state$

    const input$ = sources.input

    const newInput$ = xs.combine(
            input$,
            state$
        )
        .map(([newinput, state]) => ({...state, core: {...state.core, input: newinput } }))
        .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

    const triggerRequest$ = newInput$

    const request$ = triggerRequest$
        .map(state => {
            return {
                url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.generateSignature',
                method: 'POST',
                send: {
                    version: 'v2',
                    samples: state.core.input.join(" ")
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

    const validSignature$ = response$
        .map(r => r.body.result.join(" "))
        .filter(s => s != '')

    const invalidSignature$ = response$
        .map(r => r.body.result.join(" "))
        .filter(s => s == '')

    const data$ = response$
        .map(r => r.body.result)

    const geneStyle = {
        style: {
            'border-style': 'solid',
            'border-width': '1px',
            'margin': '2px 2px 2px 2px'
        }
    }

    // const geneAnnotationQuery = GeneAnnotationQuery(sources)

    const geneAnnotationQuery = GeneAnnotationQuery(sources)
    const geneAnnotations$ = geneAnnotationQuery.output
    const hover$ = geneAnnotationQuery.hover

    // top: 'calc(100% - 30px)', height: '30px', 
    const showGene = (thisGene, selectedGene, annotation) =>
        div('.col .orange .lighten-4 .genePopup .' + thisGene, geneStyle, [
            thisGene,
            ((selectedGene.trim() == thisGene.trim()) && !(isEmpty(annotation))) ?
            div('.col .active .black .white-text', { style: { 'font-size': '12px', position: 'fixed', visibility: 'visible', opacity: 0.8, padding: '5px', width: '400px' } }, [
                div('.tooltip-content', [
                    p('Name: ' + annotation.name),
                    p(["Link: ", a({ props: { href: annotation.uniprot, target: "_blank" } }, annotation.uniprot)]),
                    p("EntrezID: " + annotation.entrezid),
                    p("Ensembl: " + annotation.ensembl),
                    p("Function: " + annotation.function),
                ])
            ]) :
            div('.active .white', { style: { position: 'fixed', visibility: 'invisible', opacity: 0 } }, [])
        ])

    const validVdom$ = xs.combine(validSignature$, hover$, geneAnnotations$)
        .map(([s, hover, annotation]) => div('.card .orange .lighten-3', [
            div('.card-content .orange-text .text-darken-4', [
                span('.card-title', 'Signature:'),
                div('.row', { style: { fontSize: "16px", fontStyle: 'bold' } },
                    s.split(" ").map(gene => showGene(gene, hover, annotation)))
            ])
        ]))
        .startWith(div('.card .orange .lighten-3', []))

    const invalidVdom$ = invalidSignature$
        .map(s => div('.card .orange .lighten-3', [
            div('.card-content .red-text .text-darken-1', [
                div('.row', { style: { fontSize: "16px", fontStyle: 'bold' } }, [
                    p('.center', { style: { fontSize: "26px" } }, "The resulting signature is empty, please check the sample selection!")
                ])
            ])
        ]))
        .startWith(div('.card .orange .lighten-3', []))


    const vdom$ = xs.merge(invalidVdom$, validVdom$)

    const signature$ = xs.merge(validSignature$, invalidSignature$).remember()

    // Initialization
    const defaultReducer$ = xs.of(prevState => ({...prevState, core: { input: '' } }))
        // Add input to state
    const inputReducer$ = input$.map(i => prevState => ({...prevState, core: {...prevState.core, input: i } }))
        // Add request body to state
    const requestReducer$ = request$.map(req => prevState => ({...prevState, core: {...prevState.core, request: req } }))
        // Add data from API to state, update output key when relevant
    const dataReducer$ = data$.map(newData => prevState => ({...prevState, core: {...prevState.core, data: newData, output: newData.join(" ") } }))

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            geneAnnotationQuery.log
        ),
        DOM: vdom$,
        output: signature$,
        HTTP: xs.merge(request$, geneAnnotationQuery.HTTP),
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            dataReducer$,
            requestReducer$
        )
    }

}

export { SignatureGenerator, signatureLens }