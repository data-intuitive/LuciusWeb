import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { i, p, div, br, label, input, code, table, tr, td, b, h2, button, textarea, a, ul, li, span, th, thead, tbody } from '@cycle/dom';
import { clone, equals, merge } from 'ramda';
import xs from 'xstream';
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import debounce from 'xstream/extra/debounce'
import delay from 'xstream/extra/delay'
import { loggerFactory } from '~/../../src/js/utils/logger'
import { CompoundAnnotation } from '../components/CompoundAnnotation'
import { safeModelToUi } from '../modelTranslations'

const emptyData = {
    body: {
        result: {
            data: []
        }
    }
}

const sampleSelectionLens = {
    get: state => ({ core: (typeof state.form !== 'undefined') ? state.form.sampleSelection : {}, settings: state.settings }),
    // get: state => ({core: state.form.sampleSelection, settings: state.settings}),
    set: (state, childState) => ({...state, form: {...state.form, sampleSelection: childState.core } })
};

/**
 * Based on a (list of) compound(s), get the samples that correspond to it and allow users to select them.
 *
 * input: compound(s) (string)
 * output: list of samples (array)
 */
function SampleSelection(sources) {

    const compoundAnnotations = CompoundAnnotation(sources)

    const logger = loggerFactory('sampleSelection', sources.onion.state$, 'settings.form.debug')

    const state$ = sources.onion.state$

    const input$ = sources.input

    // When the component should not be shown, including empty signature
    const isEmptyState = (state) => {
        if (typeof state.core === 'undefined') {
            return true
        } else {
            if (typeof state.core.input === 'undefined') {
                return true
            } else {
                if (state.core.input == '') {
                    return true
                } else {
                    return false
                }
            }
        }
    }

    const emptyState$ = state$
        // .filter(state => state.core.input == null || state.core.input == '')
        .filter(state => isEmptyState(state))
        .compose(dropRepeats((x, y) => equals(x, y)))

    // When the state is cycled because of an internal update
    const modifiedState$ = state$
        // .filter(state => state.core.input != '')
        .filter(state => !isEmptyState(state))
        .compose(dropRepeats((x, y) => equals(x, y)))

    const newInput$ = xs.combine(
            input$,
            state$
        )
        .map(([newinput, state]) => ({...state, core: {...state.core, input: newinput } }))
        .compose(dropRepeats((x, y) => equals(x.core.input, y.core.input)))

    // When a new query is required
    const updatedState$ = state$
        .compose(dropRepeats((x, y) => equals(x.core, y.core)))

    const request$ = newInput$
        .map(state => {
            return {
                url: state.settings.api.url + '&classPath=com.dataintuitive.luciusapi.compoundToSamples',
                method: 'POST',
                send: {
                    version: 'v2',
                    query: state.core.input,
                    pvalue: state.settings.common.pvalue
                },
                'category': 'samples'
            }
        })

    const response$ = sources.HTTP
        .select('samples')
        .map((response$) =>
            response$.replaceError(() => xs.of(emptyData))
        )
        .flatten()

    const data$ = response$
        .map(res => res.body)
        .map(json => json.result.data)
        .remember()

    // Helper function for rendering the table, based on the state
    const makeTable = (state, annotation, initialization) => {
        const data = state.core.data
        const blurStyle = (state.settings.common.blur) ? { style: { filter: 'blur(' + state.settings.common.amountBlur + 'px)' } } : {}
        const selectedClass = (selected) => (selected) ? '.black-text' : '.grey-text .text-lighten-2'
        let rows = data.map(entry => [
            td('.selection', { props: { id: entry.id } }, [
                label('', { props: { id: entry.id } }, [
                    input('.grey', { props: { type: 'checkbox', checked: entry.use, id: entry.id } }, 'tt'),
                    span([''])
                ])
            ]),
            td('.compoundPopup' + selectedClass(entry.use), blurStyle, entry.compound_id),
            td(selectedClass(entry.use), blurStyle,
              (entry.compound_name.length > 20) ? entry.compound_name.substring(0, 20) + '...' : entry.compound_name
            ),
            td(".left-align" + selectedClass(entry.use),
              (entry.id.length > 30) ? entry.id.substring(0, 30) + '...' : entry.id
            ),
            td(selectedClass(entry.use), entry.protocolname),
            td(selectedClass(entry.use),
              (entry.concentration.length > 6) ? entry.concentration.substring(0, 6) + '...' : entry.concentration
            ),
            td(selectedClass(entry.use), entry.batch),
            td(selectedClass(entry.use), entry.year),
            td(selectedClass(entry.use), entry.time),
            td(selectedClass(entry.use), entry.significantGenes)

        ]);
        const header = tr([
            th('Use?'),
            th(safeModelToUi('id', state.settings.common.modelTranslations)),
            th('Name'),
            th('Sample'),
            th('Protocol'),
            th('Conc'),
            th('Batch'),
            th('Year'),
            th('Time'),
            th('Sign. Genes')
        ]);

        let body = [];
        rows.map(row => body.push(tr(row)));
        const tableContent = [thead([header]), tbody(body)];

        return (
            div([
                div('.row', [
                    div('.col .s10 .offset-s1 .l10 .offset-l1', [table('.striped .centered', tableContent)]),
                    annotation,
                    div('.row .s6 .offset-s3', [
                        (initialization)
                          ? span([])
                          : button('.doSelect .btn .col .offset-s4 .s4 .orange .darken-2', 'Select')
                    ]),
                ])
            ])
        );
    }

    const initVdom$ = emptyState$.mapTo(div())

    const loadingVdom$ = request$.compose(sampleCombine(state$))
      .map( ([_, state]) =>
        // Use the same makeTable function, pass a initialization=true parameter and a body DOM with preloading
        makeTable(
          state,
          div('.col.s10.offset-s1.l10.offset-l1', [
            div('.progress.orange.lighten-3', { style: { margin: '2px 0px 2px 0px'} }, [
              div('.indeterminate', {style : { "background-color" : 'white' }})
            ])
          ]),
          true
        )
      )
      .remember()

    const loadedVdom$ = xs.combine(modifiedState$, compoundAnnotations.DOM)
        .map(([state, annotation]) => makeTable(state, annotation, false))

    const vdom$ = xs.merge(initVdom$, loadingVdom$, loadedVdom$)

    const dataReducer$ = data$.map(data => prevState => {
        const newData = data.map(el => merge(el, { use: true }))
        return {
            ...prevState,
            core: {
                ...prevState.core,
                data: newData,
                output: newData.filter(x => x.use).map(x => x.id)
            }
        }
    })

    const useClick$ = sources.DOM
        .select('.selection')
        .events('click', { preventDefault: true })
        .map(ev => ev.ownerTarget.id)

    const aDown$ =
        sources.DOM.select('document')
            .events('keydown')
            .map(ev => ev.code)
            .filter(code => code == "KeyA")
            .mapTo(true)
            .startWith(false)

    // A modifier stream
    const aUp$ =
        sources.DOM.select('document')
            .events('keyup')
            .map(ev => ev.code)
            .filter(code => code == "KeyA")
            .mapTo(false)

    const a$ =
        xs.merge(aDown$, aUp$)
            .compose(dropRepeats(equals))

    const selectReducer$ = 
      useClick$
        .compose(sampleCombine(a$))
        .map(([id, a]) => prevState => {
          // a = false is the usual behavior
          if (!a) {
            const newData = prevState.core.data.map(el => {
              // One sample object
              var newEl = clone(el)
              const switchUse = (id === el.id)
              newEl.use = (switchUse) ? !el.use : el.use
              // console.log(el)
              // console.log(newEl)
              return newEl
            })
            return ({
                ...prevState,
                core: {
                    ...prevState.core,
                    data: newData,
                    output: newData.filter(x => x.use).map(x => x.id)
                }
            })
        } else {
            const newData = prevState.core.data.map(el => {
              // One sample object
              var newEl = clone(el)
              newEl.use = !el.use
              return newEl
            })
            return ({
                ...prevState,
                core: {
                    ...prevState.core,
                    data: newData,
                    output: newData.filter(x => x.use).map(x => x.id)
                }
            })

        }
    })

    const defaultReducer$ = xs.of(prevState => ({...prevState, core: { input: '', data: [] } }))
    const inputReducer$ = input$.map(i => prevState => ({...prevState, core: {...prevState.core, input: i } }))
    const requestReducer$ = request$.map(req => prevState => ({...prevState, core: {...prevState.core, request: req } }))

    const sampleSelection$ =
        xs.merge(
            sources.DOM.select('.doSelect').events('click'),
            // Ghost mode
            sources.onion.state$.map(state => state.core.ghostoutput).filter(ghost => ghost).compose(dropRepeats())
        )
        .compose(sampleCombine(state$))
        .map(([ev, state]) => state.core.output)

    return {
        log: xs.merge(
            logger(state$, 'state$'),
        ),
        DOM: vdom$,
        HTTP: xs.merge(
            request$,
            compoundAnnotations.HTTP
        ),
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            requestReducer$,
            dataReducer$,
            selectReducer$
        ),
        output: sampleSelection$,
        modal: compoundAnnotations.modal
    }
}

export { SampleSelection, sampleSelectionLens }
