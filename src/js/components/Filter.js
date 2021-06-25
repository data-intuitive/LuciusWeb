import sampleCombine from 'xstream/extra/sampleCombine'
import isolate from '@cycle/isolate'
import { ul, li, form, i, p, div, br, label, input, code, table, tr, td, b, h2, h5, button, textarea, a, select, option, span } from '@cycle/dom';
import { clone, merge, mergeAll } from 'ramda';
import xs from 'xstream';
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import dropRepeats from 'xstream/extra/dropRepeats'
import { loggerFactory } from '../utils/logger'
import { difference, keys, head, prop, assocPath, equals } from 'ramda'
import { initSettings } from '../configuration'

export const compoundFilterLens = {
    get: state => ({ core: state.filter, settings: state.settings.filter }),
    set: (state, childState) => ({ ...state, filter: childState.core })
}

/**
 * Provide a filter form. We inject (via input) a signature in order to hide the form when an empty signature is present.
 *
 * Please note that the filter state object contains the values for the filter that should be _included_.
 * If the filter is empty, it means all values should be included (no filter)
 *
 * - input$: stream of signature updates
 * - output$: to be consumed by components that require filter functionality, object with filter values.
 */
function Filter(sources) {

    const logger = loggerFactory('filter', sources.onion.state$, 'settings.filter.debug')

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
        .filter(([_, state]) => !isEmptyState(state))
        .map(([i, state]) => ({ ...state, core: { ...state.core, input: i } }))
        .compose(dropRepeats(equals))

    // This for ghost mode, inject changes via external state updates...
    const ghostChanges$ = modifiedState$
        .filter(state => typeof state.core.ghost !== 'undefined')
        .compose(dropRepeats())

    const expandAnyGhost$ = ghostChanges$.map(state => state.core.ghost.expand).startWith(false)

    const expandConcentrationUI$ = sources.DOM
        .select('.concentration')
        .events('click')
        .fold((x, y) => !x, false)
        .startWith(false)

    const expandConcentration$ = xs.merge(expandConcentrationUI$, expandAnyGhost$).remember()

    const expandProtocolUI$ = sources.DOM
        .select('.protocol')
        .events('click')
        .fold((x, _) => !x, false)
        .startWith(false)

    const expandProtocol$ = xs.merge(expandProtocolUI$, expandAnyGhost$).remember()

    const expandTypeUI$ = sources.DOM
        .select('.type')
        .events('click')
        .fold((x, _) => !x, false)
        .startWith(false)

    const expandType$ = xs.merge(expandTypeUI$, expandAnyGhost$).remember()

    // Helper functions for options: all unset or all set
    const noFilter = (selectedOptions, possibleOptions) => (selectedOptions.length == possibleOptions.length)
    // const allFilter = (selectedOptions, possibleOptions) => (selectedOptions.length == 0)

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
        '.collection-item ' + '.' + filter + '-options', { props: { id: option }}, [
            label({ props: { id: option } }, [
                input(isSelectedProps(option, selectedOptions), ''),
                span({ props: { id: option }, style: { padding : 2} }, [option])
            ])
        ])

    /**
     * A table of check boxes that is only shown if needed
     * @param {*} toggle Visible or not?
     * @param {*} options Array of possible options
     * @param {*} selection Array of selections (multiple)
     */
    const togglableFilter = (filter, toggle, possibleOptions, selectedOptions) =>
        toggle
          ? div('.col .s12', [
              div('.col.l6.s12', [
                div('.collection .selection',
                    possibleOptions
                      .filter((_,i) => i < possibleOptions.length/2)
                      .map(option => filterSwitch(filter, option, selectedOptions))
                )]),
              div('.col.l6.s12', [
                div('.collection .selection',
                    possibleOptions
                      .filter((_,i) => i >= possibleOptions.length/2)
                      .map(option => filterSwitch(filter, option, selectedOptions))
                )
              ])
            ])
          : div('.protocol .col .s10 .offset-s1', [''])

    const emptyVdom$ = emptyState$.mapTo(div())

    const loadedVdom$ = xs.combine(modifiedState$, expandConcentration$, expandProtocol$, expandType$)
        .map(([state, toggleConcentration, toggleProtocol, toggleType]) => {
            const possibleConcentrations = state.settings.values.concentration
            const possibleProtocols = state.settings.values.protocol
            const possibleTypes = state.settings.values.type

            const selectedConcentrations =
              (state.core.output.concentration == undefined)
                ? possibleConcentrations
                : state.core.output.concentration
            const selectedProtocols =
              (state.core.output.protocol == undefined)
                ? possibleProtocols
                : state.core.output.protocol
            const selectedTypes =
              (state.core.output.type == undefined)
                ? possibleTypes
                : state.core.output.type

            return div([
                div('.col .s12', [
                    div('.chip .concentration .col .s12', [
                        span('.concentration .blue-grey-text', [
                            noFilter(selectedConcentrations, possibleConcentrations)
                            // (selectedConcentrations == undefined)
                              ? 'No Concentration Filter'
                              : 'Concentrations: ' + selectedConcentrations.join(', ')
                        ])
                    ]),
                    togglableFilter('concentration', toggleConcentration, possibleConcentrations, selectedConcentrations)
                ]),
                div('.col .s12', [
                    div('.chip .protocol .col .s12', [
                        span('.protocol .blue-grey-text', [
                            noFilter(selectedProtocols, possibleProtocols)
                            // (selectedProtocols == undefined)
                              ? 'No Protocol Filter'
                              : 'Protocols: ' + selectedProtocols.join(', ')
                        ])
                    ]),
                    togglableFilter('protocol', toggleProtocol, possibleProtocols, selectedProtocols)

                ]),
                div('.col .s12', [
                    div('.chip .type .col .s12', [
                        span('.type .blue-grey-text', [
                            noFilter(selectedTypes, possibleTypes)
                            // (selectedTypes == undefined)
                              ? 'No Type Filter'
                              : 'Types: ' + selectedTypes.join(', ')
                        ])
                    ]),
                    togglableFilter('type', toggleType, possibleTypes, selectedTypes)
                ])
            ])
        })

    const vdom$ = xs.merge(
        emptyVdom$,
        loadedVdom$//.startWith(div())
    )

    // Trigger when all filter fields are collapsed
    const expandAny$ = xs.combine(expandConcentration$, expandProtocol$, expandType$)
        .filter(([concentrationExpanded, protocolExpanded, typeExpanded]) => !concentrationExpanded && !protocolExpanded && !typeExpanded)

    // Push filter through as output field ONLY when filter fields are collapsed
    // This is to avoid too frequent updates
    // merge with the first state update in order to have at a value during initialization
    // When the filter is not set, ALL values are present and we transform that into NO values
    const filter$ = xs.merge(
        state$.take(1).map(state => ({...state, core : {...state.core, output : state.settings.values}})),
        expandAny$.compose(sampleCombine(modifiedState$)).map(([_, state]) => state)
      )
      // .map(state => state.settings.values)
      .map(state => {
        const filterKeys = keys(state.settings.values)
        var o = {}
        // Mutable approach to transforming the values
        filterKeys
          .forEach(key => {
            // If no values are present, ALL values are selected
            const actual =
              (prop(key, state.core.output) == undefined)
                ? prop(key, state.settings.values)
                : prop(key, state.core.output)
            if (difference(prop(key, state.settings.values), actual).length != 0) {
              o[key] = prop(key, state.core.output)
            }
          })
        return o
      })
      .remember()

    // Toggles for filter options
    const toggledGhost$ =
              ghostChanges$
                .filter(state => typeof state.core.ghost.deselect !== 'undefined')
                .map(state => state.core.ghost.deselect)
                .compose(dropRepeats(equals))

    const concentrationToggled$ =
        sources.DOM.select('.concentration-options')
            .events('click')
            .map(function (ev) { ev.preventDefault(); return ev; })
            .map(ev => ev.ownerTarget.id)
            .map(value => ({ concentration: value }))

    const protocolToggled$ =
        sources.DOM.select('.protocol-options')
            .events('click')
            .map(function (ev) { ev.preventDefault(); return ev; })
            .map(ev => ev.ownerTarget.id)
            .map(value => ({ protocol: value }))

    const typeToggled$ =
        sources.DOM.select('.type-options')
            .events('click')
            .map(function (ev) { ev.preventDefault(); return ev; })
            .map(ev => ev.ownerTarget.id)
            .map(value => ({ type: value }))

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
            .remember()

    /**
     * Reducers
     */
    // Add the filter values from the settings (and originally from deployments.json) to the current values
    const defaultReducer$ = xs.of(prevState =>
            ({...prevState, core: {...prevState.core, output: prevState.settings.values } })
        )

    const inputReducer$ = input$.map(i => prevState => ({ ...prevState, core: { ...prevState.core, input: i } }))

    const toggleReducer$ =
        xs.merge(concentrationToggled$, protocolToggled$, typeToggled$, toggledGhost$)
          .compose(sampleCombine(a$))
          .map(([clickedFilter, a]) => prevState => {
            // a is a modifier key. If it's not pressed it's the usual behaviour
            if (a == false) {
              // We want this function to work for 3 the different filters, so first get the appropriate one
              const filterKey = head(keys(clickedFilter))
              const filterValue = prop(filterKey, clickedFilter)
              // if already included, remove it from the list
              // take into account that no filter means ALL values included
              const currentArrayForFilterKey =
                (prop(filterKey, prevState.core.output) == undefined)
                  ? prop(filterKey, prevState.settings.values)
                  : prop(filterKey, prevState.core.output)
              const alreadyIncluded = currentArrayForFilterKey.includes(filterValue)
              // does the value have to be removed from the list?
              const newArrayForFilterKey = alreadyIncluded
                  ? currentArrayForFilterKey.filter(el => el != filterValue)
                  : currentArrayForFilterKey.concat(filterValue) // the value has to be added to the list
              // When all options are _excluded_, reset to all options _included_
              // const cleanArrayForFilterKey = (newArrayForFilterKey.length == 4) ? [] : newArrayForFilterKey
              const updatedState = assocPath(['core', 'output', filterKey], newArrayForFilterKey, prevState)
              return updatedState
            } else {
              // If a is pressed during the click, toggle ALL values
              const filterKey = head(keys(clickedFilter))
              // values currently selected
              const currentValues =
                (prop(filterKey, prevState.core.output) != undefined)
                  ? prop(filterKey, prevState.core.output)
                  : prop(filterKey, prevState.settings.values) 
              // possible values
              const allValues = prop(filterKey, prevState.settings.values)
              // possible - current values
              const newValues = allValues.filter(v => !currentValues.includes(v))
              const updatedState = assocPath(['core', 'output', filterKey], newValues, prevState)
              return updatedState
            }
          })

    const outputReducer$ =
      filter$
        .map(i => prevState => ({ ...prevState, core: { ...prevState.core, output: i } }))

    return {
        log: xs.merge(
            logger(state$, 'state$'),
        ),
        DOM: vdom$,
        output: filter$,
        onion: xs.merge(
            defaultReducer$,
            inputReducer$,
            outputReducer$,
            toggleReducer$
        )
    }

}

export { Filter }
