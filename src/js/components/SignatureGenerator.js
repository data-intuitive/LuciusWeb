import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody, h3 } from '@cycle/dom';
import { clone, equals, merge } from 'ramda';
import xs from 'xstream';
import { logThis, log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'

const emptyData = {
    body: {
        result: {
            data: []
        }
    }
}

const signatureLens = { 
    get: state => ({core: state.form.signature, settings: state.settings}),
    set: (state, childState) => ({...state, form: {...state.form, signature: childState.core}})
};

/**
 * Generate a signature from a list of samples.
 * 
 * Input: List of samples (array)
 * Output: Signature (can be empty!)
 */
function SignatureGenerator(sources) {

    const state$ = sources.onion.state$.debug(state => {
        console.log('== State in signature =================')
        console.log(state)
    });

    const input$ = sources.input

    const newInput$ = xs.combine(
            input$, 
            state$
        )
        .map(([newinput, state]) => ({...state, core: {...state.core, input: newinput}}))
        .compose(dropRepeats((x,y) => equals(x.core.input, y.core.input)))

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
        .debug()

    const response$ = sources.HTTP
        .select('generateSignature')
        .map((response$) =>
            response$.replaceError(() => xs.of(emptyData))
        )
        .flatten()
        .debug()

    const validSignature$ = response$
                        .map(r => r.body.result.join(" "))
                        .filter(s => s != '')

    const invalidSignature$ = response$
                        .map(r => r.body.result.join(" "))
                        .filter(s => s == '')

    const data$ = response$
                        .map(r => r.body.result)

    const geneStyle = {
        style : {
            'border-style': 'solid',
            'border-width': '1px',
            'margin' : '2px 2px 2px 2px'
        }
    }

    const validVdom$ = validSignature$
        .map(s => div('.card .orange .lighten-3', [
            div('.card-content .orange-text .text-darken-4', [
                span('.card-title', 'Signature:'),
                div('.row', {style: {fontSize: "16px", fontStyle: 'bold'}}, 
                    s.split(" ").map(gene => div('.col .orange .lighten-4', geneStyle, ' ' + gene + ' ')))
            ])
        ]))
        .startWith(div('.card .orange .lighten-3', []))

    const invalidVdom$ = invalidSignature$
        .map(s => div('.card .orange .lighten-3', [
            div('.card-content .red-text .text-darken-1', [
                div('.row', {style: {fontSize: "16px", fontStyle: 'bold'}}, [
                    p('.center', {style: {fontSize: "26px"}}, "The resulting signature is empty, please check the sample selection!") 
                ])
            ])
        ]))
        .startWith(div('.card .orange .lighten-3', []))

    const vdom$ = xs.merge(invalidVdom$, validVdom$)

    const signature$ = xs.merge(validSignature$, invalidSignature$)

    // Initialization
    const defaultReducer$ = xs.of(prevState => ({...prevState, core: {input: ''}}))
    // Add input to state
    const inputReducer$ = input$.map(i => prevState => ({...prevState, core: {...prevState.core, input: i}}))
    // Add request body to state
    const requestReducer$ = request$.map(req => prevState => ({...prevState, core: {...prevState.core, request: req}}))
    // Add data from API to state, update output key when relevant
    const dataReducer$ = data$.map(newData => prevState => ({...prevState, core: {...prevState.core, data: newData, output: newData.join(" ")}}))
 
    return {
        DOM: vdom$,
        output: signature$,
        HTTP: request$,
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            dataReducer$,
            requestReducer$
        )
    }

}

export { SignatureGenerator, signatureLens }