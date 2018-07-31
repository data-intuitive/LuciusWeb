import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { ul, li, form, i, p, div, br, label, input, code, table, tr, td, b, h2, h5, button, textarea, a, select, option, span } from '@cycle/dom';
import { clone, equals, merge, mergeAll } from 'ramda';
import xs from 'xstream';
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import { loggerFactory } from '~/../../src/js/utils/logger'
import { difference, keys, head, prop, assocPath } from 'ramda'
import { initSettings } from '../configuration'

export const compoundFilterLens = {
    get: state => ({ core: state.filter, settings: state.settings }),
    set: (state, childState) => ({...state, filter: childState.core })
}

/**
 * Provide a filter form. We inject (via input) a signature in order to hide the form when an empty signature is present.
 * 
 */
function Filter(sources) {

    const logger = loggerFactory('filter', sources.onion.state$, 'settings.filter.debug')

    const domSource$ = sources.DOM;
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
                if (state.core.input === '') {
                    return true
                } else {
                    return false
                }
            }
        }
    }

    const emptyState$ = state$
        .filter(input => isEmptyState(input))

    const modifiedState$ = xs.combine(input$, state$)
        .filter(([input, state]) => !isEmptyState(state))
        .map(([i, state]) => ({...state, core: {...state.core, input: i } }))

    const toggleConcentration$ = sources.DOM
        .select('.concentration')
        .events('click')
        .fold((x, y) => !x, false)
        .startWith(false)
        // .remember()

    const toggleProtocol$ = sources.DOM
        .select('.protocol')
        .events('click')
        .fold((x, y) => !x, false)
        .startWith(false)

    const toggleType$ = sources.DOM
        .select('.type')
        .events('click')
        .fold((x, y) => !x, false)
        .startWith(false)

    // Helper functions for options: all unset or all set
    const noFilter = (selectedOptions, possibleOptions) => (selectedOptions.length == possibleOptions.length)
    const allFilter = (selectedOptions, possibleOptions) => (selectedOptions.length == 0)

    /**
     * Given an option from a list of options (x) and a selection, return the properties for a checkbox
     * @param {*} option The current option in the list
     * @param {*} selection Array with selection
     */
    const isSelectedProps = (option, selectedOptions) => {
        if (selectedOptions.includes(option)) {
            return { props: { type: 'checkbox', checked: true, id: option } }
        } else {
            return { props: { type: 'checkbox', checked: false, id: option } }
        }
    }

    /**
     * A line in a table with checkboxes for use with togglableFilter
     * @param {*} filter String representing the filter, to be used for selection later
     * @param {*} option The current option in the list
     * @param {*} selection Array with selection
     */
    const filterSwitch = (filter, option, selectedOptions) => div(
        '.collection-item ' + '.' + filter + '-options', { props: { id: option } }, [
            input('.switch .filled-in-box', isSelectedProps(option, selectedOptions)),
            label('', { props: { id: option } }, option)
        ])

    /**
     * A table of check boxes that is only shown if needed
     * @param {*} toggle Visible or not?
     * @param {*} options Array of possible options
     * @param {*} selection Array of selections (multiple)
     */
    const togglableFilter = (filter, toggle, possibleOptions, selectedOptions) =>
        toggle ?
        div('.col .s10 .offset-s1', [ //{ style: { position: 'absolute', left: '0px', top: '50%', width: '50%', 'z-index': '1' } }, [
            div('.collection .selection ',
                possibleOptions.map(option => filterSwitch(filter, option, selectedOptions))
            )

        ]) :
        div('.protocol .col .s10 .offset-s1', [''])

    const emptyVdom$ = emptyState$.mapTo(div())

    const loadedVdom$ = xs.combine(modifiedState$, toggleConcentration$, toggleProtocol$, toggleType$)
        .map(([state, toggleConcentration, toggleProtocol, toggleType]) => {
            const selectedConcentrations = state.core.output.concentration
            const selectedProtocols = state.core.output.protocol
            const selectedTypes = state.core.output.type

            const possibleConcentrations = state.settings.filter.values.concentration
            const possibleProtocols = state.settings.filter.values.protocol
            const possibleTypes = state.settings.filter.values.type

            return div([
                div('.col .s12 .l4', [
                    div('.chip .concentration .col .s12', [
                        span('.concentration .blue-grey-text', [
                            noFilter(selectedConcentrations, possibleConcentrations) ? 'No Concentration Filter' : 'Concentrations: ' + selectedConcentrations.join(', ')
                        ])
                    ]),
                    togglableFilter('concentration', toggleConcentration, possibleConcentrations, selectedConcentrations)
                ]),
                div('.col .s12 .l4', [
                    div('.chip .protocol .col .s12', [
                        span('.protocol .blue-grey-text', [
                            noFilter(selectedProtocols, possibleProtocols) ? 'No Protocol Filter' : 'Protocols: ' + selectedProtocols.join(', ')
                        ])
                    ]),
                    togglableFilter('protocol', toggleProtocol, possibleProtocols, selectedProtocols)

                ]),
                div('.col .s12 .l4', [
                    div('.chip .type .col .s12', [
                        span('.type .blue-grey-text', [
                            noFilter(selectedTypes, possibleTypes) ? 'No Type Filter' : 'Types: ' + selectedTypes.join(', ')
                        ])
                    ]),
                    togglableFilter('type', toggleType, possibleTypes, selectedTypes)
                ])
            ])
        })

    const vdom$ = xs.merge(
        emptyVdom$,
        loadedVdom$.startWith(div())
    )

    // Toggles for filter options
    const concentrationToggled$ = sources.DOM.select('.concentration-options')
        .events('click')
        .map(ev => ev.ownerTarget.id)
        .map(value => ({ concentration: value }))

    const protocolToggled$ = sources.DOM.select('.protocol-options')
        .events('click')
        .map(ev => ev.ownerTarget.id)
        .map(value => ({ protocol: value }))

    const typeToggled$ = sources.DOM.select('.type-options')
        .events('click')
        .map(ev => ev.ownerTarget.id)
        .map(value => ({ type: value }))

    // This for ghost mode, inject changes via external state updates...
    const ghostChanges$ = state$
        .filter(state => typeof state.core.ghostinput !== 'undefined')
        .map(state => state.core.ghostinput)
        .compose(dropRepeats())


    // Trigger when all filter fields are collapsed
    const toggleAny$ = xs.combine(toggleConcentration$, toggleProtocol$, toggleType$)
        .filter(([concentrationToggled, protocolToggled, typeToggled]) => !concentrationToggled && !protocolToggled && !typeToggled)

    // Push filter through as output field ONLY when filter fields are collapsed
    const filter$ = toggleAny$.compose(sampleCombine(modifiedState$))
        .map(([t, state]) => state.core.output)
        .startWith(initSettings.filter.values)

    /**
     * Reducers
     */

    const defaultReducer$ = xs.of(prevState => ({...prevState,
        core: {...prevState.core,
            output: initSettings.filter.values
        }
    }))

    const inputReducer$ = input$.map(i => prevState => ({...prevState, core: {...prevState.core, input: i } }))

    const toggleReducer$ = xs.merge(
            concentrationToggled$, protocolToggled$, typeToggled$)
        .map(clickedConcentration => prevState => {
            // We want this function to work for 3 the different filters, so first get the appropriate one
            const filterKey = head(keys(clickedConcentration))
            const filterValue = prop(filterKey, clickedConcentration)
                // if already included, remove it from the list
            const currentArrayForFilterKey = prop(filterKey, prevState.core.output)
            const alreadyIncluded = currentArrayForFilterKey.includes(filterValue)
            const newArrayForFilterKey = alreadyIncluded ?
                currentArrayForFilterKey.filter(el => el != filterValue) : // the value has to be removed from the list
                currentArrayForFilterKey.concat(filterValue) // the value has to be added to the list
                // When all options are _excluded_, reset to all options _included_
                // const cleanArrayForFilterKey = (newArrayForFilterKey.length == 4) ? [] : newArrayForFilterKey
            const updatedState = assocPath(['core', 'output', filterKey], newArrayForFilterKey, prevState)
            return updatedState
        })


    const outputReducer$ = filter$.map(i => prevState => ({...prevState, core: {...prevState.core, output: i } }))

    return {
        log: xs.merge(
            logger(state$, 'state$'),
            // logger(filter$, 'filter$')
        ),
        DOM: vdom$,
        output: filter$,
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            outputReducer$,
            toggleReducer$
        )
    };

}

export { Filter }