import sampleCombine from 'xstream/extra/sampleCombine'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody, h3 } from '@cycle/dom';
import { clone, equals, isEmpty } from 'ramda';
import xs from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats'
import { loggerFactory } from '../utils/logger'
import { GeneAnnotationQuery } from './GeneAnnotationQuery'
import { absGene } from '../utils/utils'
import { busyUiReducer, dirtyWrapperStream } from "../utils/ui"

/**
 * @module components/SignatureGenerator
 */

const emptyData = {
    body: {
        result: {
            data: []
        },
        status: "error"
    }
}

const signatureLens = {
    get: state => ({ core: state.form.signature, settings: state.settings,
        ui: (state.ui??{}).signature ?? {dirty: false}, // Get state.ui.signature in a safe way or else get a default
     }),
    set: (state, childState) => ({ ...state, form: { ...state.form, signature: childState.core } })
};

function model(newInput$, request$, jobId$, jobStatus$, data$, showMore$) {

    // Initialization
    const defaultReducer$ = xs.of(prevState => ({ ...prevState, core: { input: '' } }))
    // Add input to state
    const inputReducer$ = newInput$.map(i => prevState => ({ ...prevState, core: { ...prevState.core, input: i.core.input } }))
    // Add request body to state
    const requestReducer$ = request$.map(req => prevState => ({ ...prevState, core: { ...prevState.core, request: req } }))
    // Add jobId from request response
    const jobIdReducer$ = jobId$.map(id => prevState => ({ ...prevState, core: { ...prevState.core, jobId: id } }))
    // Add jobStatus from job response
    const jobStatusReducer$ = jobStatus$.map(status => prevState => ({ ...prevState, core: { ...prevState.core, jobStatus: status } }))
    // Add data from API to state, update output key when relevant
    const dataReducer$ = data$.map(newData => prevState => ({ ...prevState, core: { ...prevState.core, data: newData, output: newData.join(" ") } }))
    // Logic and reducer stream that monitors if this component is busy
    const busyReducer$ = busyUiReducer(newInput$, data$)
    // Toggle how many signature genes can be displayed
    const limitReducer$ = showMore$.map(showMore => prevState => ({
        ...prevState, 
        core: { 
            ...prevState.core, 
            showMore: showMore, 
            showLimit: (showMore ? 0 : 100) 
        }
    }))

    return xs.merge(
        defaultReducer$,
        inputReducer$,
        dataReducer$,
        requestReducer$,
        jobIdReducer$,
        jobStatusReducer$,
        busyReducer$,
        limitReducer$,
    )
}

/**
 * SignatureGenerator view, display the component on the vdom
 * @function view
 * @param {Stream} state$ full state onion
 * @param {Stream} request$ Trigger from API request to display the loading vdom
 * @param {Stream} response$ Reply from API containing signature
 * @param {Object} geneAnnotationQuery Object with DOM member to be added in vdom
 * @returns Object with:
 *          - vdom$: VNodes object
 *          - signature$: stream of the processed signature
 */
function view(state$, request$, response$, geneAnnotationQuery) {

    const validSignature$ = response$
        .map(r => r.body.result.join(" "))
        .filter(s => s != '')

    const invalidSignature$ = response$
        .map(r => r.body.result.join(" "))
        .filter(s => s == '')

    const amountOfInputs$ = state$.map((state) => (state.core?.input?.length)).compose(dropRepeats(equals)).remember()

    const signature$ = xs.merge(validSignature$, invalidSignature$).remember()

    const geneStyle = {
        style: {
            'border-style': 'solid',
            'border-width': '1px',
            'margin': '2px 2px 2px 2px'
        }
    }

    /**
     * Wrap a gene string into a div with styling
     * @const view/showGene
     * @param {String} thisGene 
     * @returns VNode div
     */
    const showGene = (thisGene) =>
    div('#' + absGene(thisGene) + '.col.orange.lighten-4.genePopup', geneStyle, [
        thisGene
    ])

    /** 
     * Split off signature display limits from full state
     * Needed to prevent lots of vdom updates whenever state changes without vdom changes
     * Otherwise would e.g. cause ~ 6-10 validVdom updates while loadingVdom should be displayed
     * @const view/signatureLimits$
     * @type {Stream}
     */
    const signatureLimit$ = state$.map((state) => ({
        showMore: state.core.showMore,
        showLimit: state.core.showLimit
    }))
    .compose(dropRepeats(equals))

    /**
     * Vdom to be displayed when the signature is received and valid
     * @const view/validVdom$
     * @type {Stream}
     */
    const validVdom$ = xs.combine(validSignature$, geneAnnotationQuery.DOM, signatureLimit$, amountOfInputs$)
        .map(([s, annotation, signatureLimit, amount]) => {
            /**
             * Signature split into an array
             * @const view/validVdom$/arr
             * @type {Array}
             */
            const arr = s.split(" ")

            /**
             * Show full signature or not
             * @const view/validVdom$/showMore
             * @type {Boolean}
             */
            const showMore = signatureLimit.showMore

            /**
             * Signature size limit
             * If set to 0 in the settings it means there is no limit,
             * however if we would pass 0 to Array.splice we get nothing.
             * Instead we have to pass Array.splice(0, undefined) which would be the same as Array.splice(0)
             * @const view/validVdom$/showLimit
             * @type {Number}
             */
            const showLimit =
              signatureLimit.showLimit > 0 &&
              signatureLimit.showLimit < arr.length
                ? signatureLimit.showLimit
                : undefined

            /**
             * Display div with a button when the signature is long, otherwise show empty div
             * @const view/validVdom$/showLimit
             * @type {VNode}
             */
            const showMoreButton = (showMore || arr.length > showLimit) ?
                div('.row',
                    div(".showMore .btn-flat .orange-text .text-darken-4 .right",
                        { style: { textDecoration: "underline"} },
                        showMore ? "Show less" : 
                            "Show " + (arr.length - showLimit) + " more")
                ) :
                div()

            return div('.card .orange .lighten-3', [
                div('.card-content .orange-text .text-darken-4', [
                    span('.card-title', 'Signature:'),
                    div('.row', { style: { fontSize: "16px", fontStyle: 'bold' } },
                        // genes to be shown, if needed limited amount
                        arr.slice(0, showLimit).map(gene => showGene(gene))
                        .concat(
                            /// ... -> Show more
                            showLimit !== undefined ?
                                div('.showMore.col.orange.lighten-4', geneStyle, [ '...' ]) :
                                div()
                        )
                    ),
                    showMoreButton,
                    annotation,
                    p( { style: { fontSize: "16px" } }, 
                        (() => {
                            const amountOfGenes = s.split(" ").length
                            if (amount == 1)
                                return amountOfGenes == 1 ?
                                    "This is the 1 significant gene from the selected sample." :
                                    "These are the " + amountOfGenes + " significant genes from the selected sample."
                            else if (amount > 1)
                                return amountOfGenes == 1 ?
                                    "The intersection of the significant genes from the selected samples resulted in 1 gene." :
                                    "The intersection of the significant genes from the selected samples resulted in " + amountOfGenes + " genes."
                            else
                                return "No samples were selected and yet a valid signature was generated. Please create a bug report!"
                        })()
                    ),
                ])
            ])
        })
        .startWith(div('.card .orange .lighten-3', []))

    const invalidVdom$ = xs.combine(invalidSignature$, amountOfInputs$)
        .map(([_, amount]) => div('.card .orange .lighten-3', [
            div('.card-content .red-text .text-darken-1', [
                div('.row', { style: { fontSize: "16px", fontStyle: 'bold' } }, [
                    p('.center', { style: { fontSize: "26px" } }, 
                        (() => {
                            if (amount == 1)
                                return "The selected sample didn't return any significant genes from which to create a signature!"
                            else if (amount > 1)
                                return "The resulting signature is empty as there is no intersection of significant genes in the selected samples!"
                            else
                                return "No samples were selected from which to create a signature!"
                        })()
                    )
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

/**
 * SignatureGenerator intent, convert events on the dom to actions
 * @function intent
 * @param {Stream} domSource$ events from the dom
 * @returns Object with:
 *          - showMore: boolean when 'showMore' is toggled on or off
 */
function intent(domSource$) {
    /**
     * Toggles 'showMore' on and off
     * @const intent/showMore$
     * @type {MemoryStream}
     */
    const showMore$ = domSource$
        .select(".showMore")
        .events("click")
        .fold((x, _) => !x , false)
        .startWith(false)
        .remember()

    return {
        showMore$: showMore$,
    }
}


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

    const apiUri = "http://localhost:8090/jobs?context=luciusapi&appName=luciusapi"

    const requestPost$ = triggerRequest$
        .map(state => {
            return {
                url: apiUri + '&classPath=com.dataintuitive.luciusapi.generateSignature',
                method: 'POST',
                send: {
                    version: 'v2',
                    samples: state.core.input.join(" "),
                    pvalue: state.settings.common.pvalue
                },
                'category': 'generateSignaturePost'
            }
        })

    const responsePost$ = sources.HTTP
        .select('generateSignaturePost')
        .map((response$) =>
            response$.replaceError(() => xs.of(emptyData))
        )
        .flatten()

    const jobId$ = responsePost$
        .map(r => r.body.jobId)

    const pollTimer$ = xs.periodic(200)
    const pollTimerStatus$ = pollTimer$.compose(sampleCombine(state$))
        .map(([_, status]) => status)
        .filter(s => s.core.jobStatus == "STARTED" || s.core.jobStatus == "RUNNING")

    const apiUriGet = "http://localhost:8090/jobs/"

    const requestGet$ = pollTimerStatus$
        .map(state => {
            return {
                url: apiUriGet + state.core?.jobId,
                method: 'GET',
                'category': 'generateSignatureGet'
            }
        })

    const responseGet$ = sources.HTTP
        .select('generateSignatureGet')
        .map((response$) =>
            response$.replaceError(() => xs.of(emptyData))
        )
        .flatten()
        .filter(r => r.body.status != "STARTED" && r.body.status != "RUNNING")

    const jobStatus$ = xs.merge(responsePost$, responseGet$)
        .map(r => r.body.status)
        .startWith("idle")

    const data$ = responseGet$
        .map(r => r.body.result)

    const actions = intent(sources.DOM)

    const reducers$ = model(newInput$, requestPost$, jobId$, jobStatus$, data$, actions.showMore$)

    const views = view(state$, requestPost$, responseGet$, geneAnnotationQuery)


    return {
        log: xs.merge(
            logger(state$, 'state$'),
            geneAnnotationQuery.log
        ),
        DOM: views.vdom$,
        output: views.signature$,
        HTTP: xs.merge(
            requestPost$,
            requestGet$,
            geneAnnotationQuery.HTTP
        ),
        onion: reducers$,
        modal: geneAnnotationQuery.modal
    }

}

export { SignatureGenerator, signatureLens }
