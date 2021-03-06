import { a, div, br, label, input, p, button, code, pre, h2, h4, i, h3, h5, span, ul, li } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge, mergeAll } from 'ramda'
import { clone } from 'ramda';
import sampleCombine from 'xstream/extra/sampleCombine'
import { initSettings } from '../configuration.js'
import { pick, mix } from 'cycle-onionify';
import debounce from 'xstream/extra/debounce'

export function IsolatedSettings(sources) {
    return isolate(Settings, 'settings')(sources)
}

export function Settings(sources) {

    const settings$ = sources.onion.state$

    const settingsConfig = [{
            group: 'common',
            title: 'Common Settings',
            settings: [
                // {
                //     field: 'ghostMode',
                //     type: 'checkbox',
                //     class: '.switch',
                //     title: 'Ghost Mode',
                //     props: { type: 'checkbox' }
                // },
                {
                    field: 'pvalue',
                    class: 'text',
                    type: '.input-field',
                    title: 'p-value',
                    props: { type: 'text' }
                },
                {
                    field: 'blur',
                    class: '.switch',
                    type: 'checkbox',
                    title: 'Blur?',
                    props: { type: 'checkbox' }
                },
                {
                    field: 'amountBlur',
                    class: '.range-field',
                    type: 'range',
                    title: 'Amount blur?',
                    props: { type: 'range', min: 0, max: 10 }
                }
            ]
        },
        {
            group: 'compoundTable',
            title: 'Compound Table Settings',
            settings: [
                {
                    field: 'count',
                    class: '.range-field',
                    type: 'range',
                    title: '# of entries in table',
                    props: { type: 'range', min: 0, max: 100 }
                },
            ]
        },
        {
            group: 'headTable',
            title: 'Top Table Settings',
            settings: [
                {
                    field: 'count',
                    class: '.range-field',
                    type: 'range',
                    title: '# of entries in table',
                    props: { type: 'range', min: 0, max: 20 }
                },
            ]
        },
        {
            group: 'tailTable',
            title: 'Bottom Table Settings',
            settings: [
                {
                    field: 'count',
                    class: '.range-field',
                    type: 'range',
                    title: '# of entries in table',
                    props: { type: 'range', min: 0, max: 20 }
                },
            ]
        },
        {
            group: 'plots',
            title: 'Combined (binned) plots',
            settings: [
                {
                    field: 'bins',
                    class: '.range-field',
                    type: 'range',
                    title: '# of bins in Histogram and Y-direction',
                    props: { type: 'range', min: 5, max: 50 }
                },
                {
                    field: 'binsX',
                    class: '.range-field',
                    type: 'range',
                    title: '# of bins in X direction',
                    props: { type: 'range', min: 5, max: 50 }
                },
            ]
        }
    ]

    const makeSetting = (config) => (sources) => {
        const state$ = sources.onion.state$

        const update$ = (config.type == 'checkbox') ?
            sources.DOM.select('input').events('click').map(event => event) :
            sources.DOM.events('input').map(event => event.target.value)

        const vdom$ =
            state$.map(state =>
                li('.collection-item .row',
                    div('.valign-wrapper', [

                        span('.col .l6 .s12 .truncate', [
                            span('.flow-text', [config.title]),
                            span(['  ']),
                            span('.grey-text .text-lighten-1 .right-align', ['(', state.toString(), ')'])
                        ]),

                        div('.col .s6 ' + config.class,

                            (config.type == 'checkbox')
                            // Checkbox form
                            ?
                            [
                                label('.active', [
                                    // config.title,
                                    input({ props: merge(config.props, { checked: state }) }),
                                    span('.lever'),
                                ])
                            ]
                            // Range or input
                            :
                            [
                                input({ props: merge(config.props, { value: state }) }),
                                // label(config.field),
                            ]
                        )

                    ])
                ))

        const updateReducer$ = (config.type == 'checkbox') ?
            update$.map(update => prevState => !prevState) :
            update$.map(update => prevState => update)

        return {
            DOM: vdom$,
            onion: updateReducer$
        }

    }

    const makeSettingsGroup = (settingsGroupObj) => (sources) => {
        const group$ = sources.onion.state$
        const settingsArray = settingsGroupObj.settings
        const title = settingsGroupObj.title

        const components$ = xs.of(settingsArray)
            .map(settings =>
                settings.map(setting =>
                    isolate(makeSetting(setting), setting.field)(sources)
                )
            )
            .remember()

        const vdom$ = components$
            .compose(pick('DOM'))
            .compose(mix(xs.combine))
            .map(vdoms =>
                ul('.collection .with-header', [
                    li('.collection-header .grey .lighten-2', [
                        h4(title)
                    ])
                ].concat(vdoms))
            )
            .remember()

        const reducer$ = components$
            .compose(pick('onion'))
            .compose(mix(xs.merge))

        return {
            onion: reducer$,
            DOM: vdom$
        }
    }

    const makeSettings = (settingsObj) => (sources) => {
        const settings$ = sources.onion.state$

        const groups$ = xs.of(settingsObj)
            .map(groups =>
                groups.map(group =>
                    isolate(makeSettingsGroup(group), group.group)(sources)
                )
            )
            .remember()

        const vdom$ = groups$
            .compose(pick('DOM'))
            .compose(mix(xs.combine))
            .map(vdoms =>
                div('.col .l8 .offset-l2 .s12', vdoms)
            )
            .remember()

        const reducer$ = groups$
            .compose(pick('onion'))
            .compose(mix(xs.merge))
            .remember()

        return {
            onion: reducer$,
            DOM: vdom$
        }
    }

    const Settings = makeSettings(settingsConfig)(sources)

    const vdom$ = xs.combine(settings$, Settings.DOM)
        .map(([_, topTableEntries]) =>
            div('.row .grey .lighten-3', { style: { margin: '0px 0px 0px 0px' } }, [
                div('.row .s12', ['']),
                topTableEntries,
                div('.row .s12', ['']),
                button('.reset .col .s2 .offset-s3 .btn .grey', 'Reset to Default'),
                button('.admin .col .s2 .offset-s2 .btn .grey .lighten-2 .grey-text', 'Go to Admin Settings'),
                div('.row .s12', ['']),
            ])
        ).remember()

    // When the reset button is pressed, we remove the ComPass key from the local storage
    // and reload the page. The `defaultReducer$` in `index.js` handles taking care of
    // the deployment scenario.
    const reset$ = sources.DOM.select('.reset').events('click').remember()
    // Reset the storage by removing the ComPass key
    const resetStorage$ = reset$.mapTo({ action: "removeItem", key : "ComPass"})

    const admin$ = sources.DOM.select('.admin').events('click').remember()

    // The router does not reload the same page, so use the browser functionality for that...
    const resetRouter$ = reset$.map(_ => location.reload()).mapTo('/settings').remember()
    const adminRouter$ = admin$.mapTo('/admin').remember()

    // This is an effect and should be moved to a driver...
    // TODO
    // const reload$ = xs.merge(resetRouter$, adminRouter$).compose(debounce(20)).map(_ => location.reload())

    return {
        DOM: vdom$,
        onion: Settings.onion.compose(debounce(200)),
        router: xs.merge(resetRouter$, adminRouter$),
        storage: resetStorage$
    };
}
