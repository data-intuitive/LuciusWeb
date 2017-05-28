import { a, div, br, label, input, p, button, code, pre } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge } from 'ramda'
import { clone, equal, equals, mergeAll, prop, props } from 'ramda';
import dropRepeats from 'xstream/extra/dropRepeats'

import { initSettings } from './settings'

// Components
import { Statistics } from '../components/Statistics'

function StatisticsWorkflow(sources) {

	const state$ = sources.onion.state$.debug(state => {
		console.log('== State in Statistics')
		console.log(state)
	});

	// Initialize if not yet done in parent (i.e. router) component (useful for testing)
	const defaultReducer$ = xs.of(prevState => {
		console.log('statistics -- defaultReducer')
		if (typeof prevState === 'undefined') {
			return { settings: initSettings }
		} else {
			return prevState
		}
	})

	// Create a stream with settings and properties based on the
	// settings keys provided. settings lives under state.
	function selectKeysFromSettings(thisState$, keys) {
		return state$
			.map(prop('settings'))
			.map(props(keys))
			.map(mergeAll)
			.compose(dropRepeats((x, y) => equals(x, y)))
	}

	// Add properties to the child component, based on what we need
	const statsProps$ = selectKeysFromSettings(state$, ['stats', 'api'])
	const statsSinks = isolate(Statistics, 'stats')(merge(sources, { props: statsProps$ }));

	const pageStyle = {
		style:
		{
			fontSize: '14px',
			opacity: '0',
			transition: 'opacity 1s',
			delayed: { opacity: '1' },
			destroy: { opacity: '0' }
		}
	}

	const vdom$ = xs.combine(
		statsSinks.DOM,
	)
		.map(([
			stats
		]) =>
			div('.row .grey .lighten-5  ', [
				div('.col .s10 .offset-s1', //pageStyle,
					[
						div('.col .s12', [stats]),
					])
			])
		);

	return {
		DOM: vdom$,
		onion: xs.merge(
			defaultReducer$,
			statsSinks.onion,
		),
		HTTP: xs.merge(
			statsSinks.HTTP,
		),
	};
}

export default StatisticsWorkflow;