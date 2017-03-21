import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import { a, h, p, div, br, label, input, code, table, tr, td, b, h2, button, svg, h5, th, thead, tbody, i } from '@cycle/dom';
import { clone } from 'ramda';
import { log } from '../utils/logger'
import { ENTER_KEYCODE } from '../utils/keycodes.js'
import { keys, filter, head, equals, omit } from 'ramda'
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

    const queryUpdated$ = state$
            // .debug(state => console.log('Checking query modified!!!'))
            .compose(dropRepeats((x, y) =>  {
                // console.log(x)
                // console.log(y)
                // console.log(x === y)
                const sameQuery = x.query === y.query
                return sameQuery
            }))
            // .debug(state => console.log('Query modified 1!!!'))
            .filter(state => state.query != null)
            // .debug(state => console.log('Query modified 2!!!'))

    // const request$ = modifiedState$ //, props$)
    const request$ = xs.combine(queryUpdated$, props$)
            .map(([state, props]) => ({
                    send : merge(state, props),
                    method: 'POST',
                    url: 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true&classPath=com.dataintuitive.luciusapi.topTable',
                    category : 'topTable'
     })).debug(log)

	// Catch the response in a stream
	const response$ = httpSource$
        .select('topTable')
        .flatten()
        .debug(log);

	// Extract the data from the result
	// TODO: check for errors coming back
	const resultData$ = response$.map(response => response.body.result.data);
    const data$ = resultData$;

    // This one makes sure the state is cycled by adding the resulting data to its child key
    const defaultReducer$ = xs.of(prevState => omit('result', prevState))

    // Delegate effective rendering to SampleTable:
    const sampleTable = isolate(SampleTable, 'result')(sources);

    const vdom$ = xs.combine(sampleTable.DOM, props$)
            .map(([dom,props]) => div([
                    div('.row', {style : {'margin-bottom' : '0px', 'background-color': props.color}}, [
                        h5('.white-text .col .s6', props.title),
                        // i('.Add .white-text .material-icons', 'playlist_add')
                    ]),
                    div('.row', [
                        dom
                    ])
                ])
            )

    const stateReducer$ = data$.map(data => prevState => merge(prevState, {result : data}))

    const reducer$ = xs.merge(
        defaultReducer$,
        stateReducer$,
        )

  return { 
    	DOM: vdom$,
        HTTP: request$,
        onion: reducer$
  };

}
