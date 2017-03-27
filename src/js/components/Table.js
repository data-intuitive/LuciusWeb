import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h5, th, thead, tbody, i, span } from '@cycle/dom';
import { clone } from 'ramda';
import { log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { keys, filter, head, equals, omit, map, prop } from 'ramda'
import { SampleTable } from './SampleTable/SampleTable'
import isolate from '@cycle/isolate'
import { merge } from 'ramda'
import dropRepeats from 'xstream/extra/dropRepeats'
// import { clone } from 'ramda';

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

    const request$ = xs.combine(modifiedState$, props$)
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
    const data$ = resultData$;

    // Delegate effective rendering to SampleTable:
    const sampleTable = isolate(SampleTable, 'result')(sources);

    function isDefined(obj) {
        if (typeof obj !== 'undefined') {
            return true
        } else {
            return false
        }
    }

    const filterText$ = xs.combine(modifiedState$, props$)
        .map(([state,props]) => {
            if (isDefined(state.filter)) {
                console.log(state.filter)
                let filters = keys(state.filter)
                console.log(filters)
                let nonEmptyFilters = filter(key => prop(key, state.filter).length > 0, filters)
                console.log(nonEmptyFilters)
                let divs = map(key => div('.chip', {style : {fontWeight : 'lighter', 'color' : 'rgba(255, 255, 255, 0.5)', 'background-color' : 'rgba(0, 0, 0, 0.2)'}}, [key, ': ', prop(key, state.filter)]), nonEmptyFilters)
                console.log(divs)
                return divs
            } else {
                return null
            }
        })

    const vdom$ = xs.combine(sampleTable.DOM, data$, props$, filterText$)
            .map(([dom, data, props, filterText]) => div([
                    div('.row .valign-wrapper', {style : {'margin-bottom' : '0px', 'padding-top' : '5px', 'background-color': props.color}}, [
                        h5('.white-text .col .s5 .valign', props.title),
                        div('.white-text .col .s7 .valign', filterText)
                        // p('.white-text .col .s2', [ filterText ])
                        // i('.Add .white-text .material-icons', 'playlist_add')
                    ]),
                    div('.row', [
                        dom
                    ])
                ])
            ).startWith(div([]))

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
        HTTP: request$,
        onion: reducer$
  };

}
