import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import debounce from 'xstream/extra/debounce'
import delay from 'xstream/extra/delay'
import { a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h5, th, thead, tbody, i, span, ul, li } from '@cycle/dom';
import { clone } from 'ramda';
import { log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { keys, filter, head, equals, omit, map, prop } from 'ramda'
import { SampleTable } from './SampleTable/SampleTable'
import isolate from '@cycle/isolate'
import { merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'
import dropUntil from 'xstream/extra/dropUntil'

export function Table(sources) {

	console.log('Starting component: Table...');

    const state$ = sources.onion.state$.debug(state => {
		console.log('== State in table =================')
		console.log(state)
	});
	const domSource$ = sources.DOM;
	const httpSource$ = sources.HTTP;
    const props$ = sources.props

    const modifiedState$ = state$
            .filter(state => state.query != '')
            .filter(state => state.query != null)
            .compose(dropRepeats((x, y) => equals(x,y)))

    const updatedProps$ = xs.combine(                            
                            props$, 
                            sources.DOM.select('.plus5').events('click').mapTo(5).fold((x,y) => x+y, 0),
                            sources.DOM.select('.min5').events('click').mapTo(5).fold((x,y) => x+y, 0)
                            ).map(([props, add5, min5]) => {
                                let isHead = (typeof props.head !== 'undefined')
                                if (isHead) {
                                    return merge(props, {head : props.head + add5 - min5})
                                } else {
                                    return merge(props, {tail : props.tail + add5 - min5})
                                }
                            })
                            
    const request$ = xs.combine(
                            modifiedState$,
                            updatedProps$)
            .map(([state, props]) => ({
                    send : merge(state, props),
                    method: 'POST',
                    url: 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true&classPath=com.dataintuitive.luciusapi.topTable',
                    category : 'topTable'
     })).debug(log)

	// Catch the response in a stream
	const response$ = httpSource$
        .select('topTable')
        .map((response$) =>
                response$.replaceError(() => xs.of([]))
			)
        .flatten()
        .debug(log);

	// Extract the data from the result
	// TODO: check for errors coming back
	const resultData$ = response$.map(response => response.body.result.data);
    const data$ = resultData$.debug('data here! -----------------')
                    // .startWith([])

    // Delegate effective rendering to SampleTable:
    const sampleTable = isolate(SampleTable, 'result')(sources);

    function isDefined(obj) {
        if (typeof obj !== 'undefined') {
            return true
        } else {
            return false
        }
    }

    const chipStyle = {
        style : {
            fontWeight : 'lighter', 
            'color' : 'rgba(255, 255, 255, 0.5)', 
            'background-color' : 'rgba(0, 0, 0, 0.2)'}
    }

    const filterText$ = xs.combine(modifiedState$, props$)
        .map(([state,props]) => {
            if (isDefined(state.filter)) {
                console.log(state.filter)
                let filters = keys(state.filter)
                console.log(filters)
                let nonEmptyFilters = filter(key => prop(key, state.filter).length > 0, filters)
                console.log(nonEmptyFilters)
                let divs = map(key => div('.chip', chipStyle, [key, ': ', prop(key, state.filter)]), nonEmptyFilters)
                console.log(divs)
                return divs
            } else {
                return []
            }
        }).startWith([])

    const smallBtnStyle = bgcolor => ({
        style : {
            'margin-bottom' : '0px', 
            'margin-top' : '0px', 
            'background-color' : bgcolor,
            opacity : 0.3,
            fontWeight : 'lighter'}
    })

    // 3 states: empty - loading - filled
    // empty: startWith covers this
    // 2 states remaining: loading - filled
    // loading is between query and result
    // []-------Request (start animation) oooooooRa
    // two vdom streams and between/notbetween and merge/flatten?

    /**
     * source: --a--b----c----d---e-f--g----h---i--j-----
     * first:  -------F------------------F---------------
     * second: -----------------S-----------------S------
     *                         between
     * output: ----------c----d-------------h---i--------
     */
    function between(first, second) {
        return (source) => first.mapTo(source.endWhen(second)).flatten()
    }

    // Keeping track of when an HTTP request is ongoing...
    const loadingVdom$ = xs.combine(
                                state$, 
                                // xs.periodic(1000), 
                                sampleTable.DOM, 
                                data$.startWith([]), 
                                props$, 
                                filterText$
                            )
                            .map(([state, dom, data, props, filterText]) => div([
                                        div('.row .valign-wrapper', {style : {'margin-bottom' : '0px', 'padding-top' : '5px', 'background-color': props.color}}, [
                                            h5('.white-text .col .s5 .valign', props.title),
                                            div('.white-text .col .s7 .valign .right-align', filterText)
                                        ]),
                                        div('.progress ', [div('.indeterminate')])
                                    ]),
                                )
                            .compose(between(request$, data$))
    // Show table when query is not in progress
    const renderVdom$ = xs.combine(
                                state$, 
                                // xs.periodic(1000), 
                                sampleTable.DOM, 
                                data$.startWith([]), 
                                props$, 
                                filterText$
                            )
                            .map(([state, dom, data, props, filterText]) => div([
                                        div('.row .valign-wrapper', {style : {'margin-bottom' : '0px', 'padding-top' : '5px', 'background-color': props.color}}, [
                                            h5('.white-text .col .s5 .valign', props.title),
                                            div('.white-text .col .s7 .valign .right-align', filterText)
                                        ]),
                                        div('.row', {style : {'margin-bottom' : '0px', 'margin-top' : '0px'}}, [
                                            dom,
                                            div('.col .s12 .right-align', [
                                                button('.min5 .btn-floating waves-effect waves-light', smallBtnStyle(props.color), [i('.material-icons', 'fast_rewind')]),
                                                button('.plus5 .btn-floating waves-effect waves-light', smallBtnStyle(props.color), [i('.material-icons', 'fast_forward')])
                                            ])
                                        ]),
                                    ])
                                )
                            .compose(between(data$, request$))
                            .startWith(div([]))      // Initial state!!!!

    const vdom$ = xs.merge(renderVdom$, loadingVdom$)

    // const vdom$ = renderVdom$ //, loadingVdom$).flatten()//.startWith(div())

    // Make sure that the state is cycled in order for SampleTable to pick it up
    const stateReducer$ = data$.map(data => prevState => {
        console.log('table -- stateReducer')
        return merge(prevState, {result : data})
    })


    const reducer$ = xs.merge(
        stateReducer$,
        )

  return { 
    	DOM: vdom$,
        HTTP: request$.compose(debounce(5000)),
        onion: reducer$
  };

}
