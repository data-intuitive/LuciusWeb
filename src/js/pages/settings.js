import { a, div, br, label, input, p, button, code, pre, h2, h4, i, h3, h5, span } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge, mergeAll } from 'ramda'
import { clone } from 'ramda';
import sampleCombine from 'xstream/extra/sampleCombine'

export const initSettings = {
	commmon: {
		version: 'v2',
	},
	headTableSettings: {
		title: 'Top Table 123',
		head: 5,
		color: 'rgb(44,123,182)',
		title: 'Top Table',
		version: 'v2'
	},
	tailTableSettings: {
		title: 'Bottom Table 123',
		tail: 5,
		color: 'rgb(215,25,28)',
		title: 'Bottom Table',
		version: 'v2'
	},
	stats: {
		endpoint: 'classPath=com.dataintuitive.luciusapi.statistics',
		dummy: 1
	},
	hist: {
		bins: 20
	},
	sim: {
		binsX: 20,
		binsY: 20
	},
	form: {},
	api: {
		hostname: 'localhost',
		port: 8080,
		context: 'luciusapi',
		appName: 'luciusapi',
		url: 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true',
	},
	sourire: {
		hostname: 'localhost',
		port: 9000,
		urlSourire: 'http://localhost:9999/molecule/'
	}
};

export function IsolatedSettings(sources) {
	return isolate(Settings, 'settings')(sources)
}

export function Settings(sources) {

	//   const router = sources.DOM.select('a').events('click')
	//     .debug(ev => ev.preventDefault())
	//     .map(ev => ev.target.pathname)

	const state$ = sources.onion.state$

	const settings$ = sources.onion.state$.debug(state => {
		console.log('== State in settings =================')
		console.log(state)
	})

	const tableHeader = (content) => [h4([
		content
	])]

	const tableSubHeader = (content) =>
		div([
			h5([
				content
			]),
			div('.row', []),
		])

	const tableHeaderEl = (content) =>
		div('.row', [
			div('.col .s12', tableHeader(content))
		])

	const vdom$ = settings$.map(state =>
		div('.row', [
			div('.col .s8 .offset-s2', [
				tableHeaderEl('Table Settings'),
				// Top Tables
				div('.card .col .s6', [
					div('.card-content', [
						span('.card-title', 'Top Table Settings'),
						div('.range-field ', [
							label('.active', '# of entries in top tables'),
							input('.headTableCount', { style: { fontSize: '20px' }, props: { type: 'range', min: 0, max: 50, value: state.headTableSettings.head } }),
						]),
						div('.input-field', [
							input('.headColor', { style: { fontSize: '20px' }, props: { type: 'text', value: state.headTableSettings.color } }),
							label('.active', 'Color for top tables'),
						])
					]),
				]),
				// Bottom Tables
				div('.card  .col .s6', [
					div('.card-content', [
						span('.card-title', 'Bottom Table Settings'),
						div('.range-field', [
							label('.active', '# of entries in bottom tables'),
							input('.tailTableCount', { style: { fontSize: '20px' }, props: { type: 'range', min: 0, max: 50, value: state.tailTableSettings.tail } }),
						]),
						div('.input-field', [
							input('.tailColor', { style: { fontSize: '20px' }, props: { type: 'text', value: state.tailTableSettings.color } }),
							label('.active', 'Color for tail tables'),
						]),
					]),
				]),
				// Histogram Settings
				tableHeaderEl('Histogram Settings'),
				div('.card', [
					div('.card-content', [
						// div('.row .container', [
						div('.range-field ', [
							label('.active', '# Bins for histogram'),
							input('.hist-bins', { style: { fontSize: '20px' }, props: { type: 'range', min: 10, max: 50, value: state.hist.bins } }),
						]),
						// ]),
					]),
				]),
				// API Settings 
				tableHeaderEl('API Settings'),
				div('.card', [
					div('.card-content', [
						div('.input-field', [
							input('.api-hostname', { style: { fontSize: '20px' }, props: { type: 'text', value: state.api.hostname } }),
							label('.active', 'API Hostname'),
						]),
						div('.input-field ', [
							input('.api-port', { style: { fontSize: '20px' }, props: { type: 'text', value: state.api.port } }),
							label('.active', 'API Port'),
						]),
					]),
				]),

				div('.row .container', [
				]),

			]),

			div('.row .container', [
				button('.apply .col .s3 .offset-s2 .btn', 'Apply'),
				button('.reset .col .s3 .offset-s2 .btn', 'Reset')
			]),
		])
	)

	// const vdom$ = xs.of(
	// 	div('.row', [
	// 		input('.nrHead .col .s8 .offset-s2', {style: {fontSize: '20px'} , props: {type: 'text', value: 3}, value: 3}) //input('.Query .col s10', {style: {fontSize: '20px'} , props: {type: 'text', value: query}, value: query})
	// 	])
	// )

	const makeConfigStream = (id, key) => {
		return sources.DOM.select(id).events('input').map(event => ({ [key]: event.target.value })).startWith({})
	}

	// Table Settings
	const headTableCount$ = makeConfigStream('.headTableCount', 'head')
	const tailTableCount$ = makeConfigStream('.tailTableCount', 'tail')
	const headColor$ = makeConfigStream('.headColor', 'color')
	const tailColor$ = makeConfigStream('.tailColor', 'color')

	const headTableSettings$ = xs.combine(settings$.map(state => state.headTableSettings), headTableCount$, headColor$)
		.map((settings) => ({
			headTableSettings: mergeAll(settings),
		}))

	const tailTableSettings$ = xs.combine(settings$.map(state => state.tailTableSettings), tailTableCount$, tailColor$)
		.map((settings) => ({
			tailTableSettings: mergeAll(settings),
		}))//.debug(console.log)

	// Table Settings
	const apiHostname$ = makeConfigStream('.api-hostname', 'hostname')
	const apiPort$ = makeConfigStream('.api-port', 'port')

	const apiSettings$ = xs.combine(settings$.map(state => state.api), apiHostname$, apiPort$)
		.map((settings) => ({
			api: mergeAll(settings)
		}))//.debug(console.log)

	// Histogram Settings
	const histBins$ = makeConfigStream('.hist-bins', 'bins')//.debug(console.log)

	const histSettings$ = xs.combine(settings$.map(state => state.hist), histBins$)
		.map((settings) => ({
			hist: mergeAll(settings)
		}))//.debug(console.log)

	// const nrHostname$ = sources.DOM.select('.hostname').events('input').map(event => ({hostname : event.target.value})).debug(console.log)
	// const nrSourire$ = sources.DOM.select('.sourire').events('input').map(event => ({sourire : event.target.value})).debug(console.log)

	const all$ = xs.combine(headTableSettings$, tailTableSettings$, apiSettings$, histSettings$)
		.map((settings) => mergeAll(settings))//.debug(console.log)

	const apply$ = sources.DOM.select('.apply').events('click')
	const reset$ = sources.DOM.select('.reset').events('click')

	const defaultReducer$ = xs.of(prevState => {
		console.log("settings -- defaultReducer")
		console.log(prevState)
		if (typeof prevState === 'undefined') {
			return clone(initSettings)
		} else {
			return prevState
		}
	})

	const updateReducer$ = apply$.compose(sampleCombine(all$))
		.map(([click, value]) => prevState => {
			console.log('settings -- updateReducer')
			return merge(prevState, value)
		})

	const resetReducer$ = reset$.compose(sampleCombine(all$))
		.map(([click, value]) => prevState => {
			console.log('settings -- resetReducer')
			return clone(initSettings)
		})


	//   const pageReducers$ = page$.map(prop('onion')).flatten()//.debug(console.log)
	//   const reducers$ = pageReducers$.startWith(initReducer$)

	return {
		DOM: vdom$,
		onion: xs.merge(
			defaultReducer$,
			updateReducer$,
			resetReducer$
		),
		// router: router
		// router : xs.of('/settings')
	};
}
