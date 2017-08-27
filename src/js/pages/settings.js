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

    const settingsConfig = [
        {
            group: 'common',
            title: 'Common Settings',
            settings: [
                {
                    field: 'version',
                    type: 'text',
                    class: '.input-field',
                    title: 'API Version',
                    props: { type: 'text' }
                },
                {
                    field: 'ghostMode',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Ghost Mode',
                    props: { type: 'checkbox' }
                },
                {
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug App?',
                    props: { type: 'checkbox' }
                },
                {
                    field: 'blur',
                    class: '.range-field',
                    type: 'range',
                    title: 'Amount of blur',
                    props: { type: 'range', min: 0, max: 10 }
                }
            ]
        },
        {
            group: 'compoundTable',
            title: 'Compound Table Settings',
            settings: [
                {
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug component?',
                    props: { type: 'checkbox' }
                },
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
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug component?',
                    props: { type: 'checkbox' }
                },
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
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug component?',
                    props: { type: 'checkbox' }
                },
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
            group: 'hist',
            title: 'Histogram Settings',
            settings: [
                {
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug component?',
                    props: { type: 'checkbox' }
                },
                {
                    field: 'bins',
                    class: '.range-field',
                    type: 'range',
                    title: '# of bins',
                    props: { type: 'range', min: 5, max: 50 }
                }
            ]
        },
        {
            group: 'sim',
            title: 'Similarity Plot Settings',
            settings: [
                {
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug component?',
                    props: { type: 'checkbox' }
                },
                {
                    field: 'binsX',
                    class: '.range-field',
                    type: 'range',
                    title: '# of bins in X direction',
                    props: { type: 'range', min: 5, max: 50 }
                },
                {
                    field: 'binsY',
                    class: '.range-field',
                    type: 'range',
                    title: '# of bins in Y direction',
                    props: { type: 'range', min: 5, max: 50 }
                }
            ]
        },
        {
            group: 'api',
            title: 'API Settings',
            settings: [
                {
                    field: 'url',
                    class: '.input-field',
                    type: 'text',
                    title: 'LuciusAPI URL',
                    props: {}
                }
            ]
        },
        {
            group: 'sourire',
            title: 'Sourire Settings',
            settings: [
                {
                    field: 'url',
                    class: '.input-field',
                    type: 'text',
                    title: 'Sourire URL',
                    props: {}
                }
            ]
        },
        {
            group: 'form',
            title: 'Form Settings',
            settings: [
                {
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug component?',
                    props: { type: 'checkbox' }
                }
            ]
        },

    ]

    const makeSetting = (config) => (sources) => {
        const state$ = sources.onion.state$

        const update$ = (config.type == 'checkbox')
            ? sources.DOM.select('input').events('click').map(event => event)
            : sources.DOM.events('input').map(event => event.target.value)

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
                                ? [
                                    label('.active', [
                                        // config.title,
                                        input({ props: merge(config.props, { checked: state }) }),
                                        span('.lever'),
                                    ])
                                ]
                                // Range or input
                                : [
                                    input({ props: merge(config.props, { value: state }) }),
                                    // label(config.field),
                                ]
                        )

                    ])
                ))

        const updateReducer$ = (config.type == 'checkbox')
            ? update$.map(update => prevState => !prevState)
            : update$.map(update => prevState => update)

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
                ul('.collection .with-header',
                    [
                        li('.collection-header .grey .lighten-2', [
                            h4(title)
                        ])
                    ].concat(vdoms)
                )
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
        .map(([state, topTableEntries]) =>
            div('.row .grey .lighten-3', {style : {margin: '0px 0px 0px 0px'}}, [
                div('.row .s12', ['']),
                topTableEntries,
                div('.row .s12', ['']),
                button('.reset .col .s4 .offset-s4 .btn .grey', 'Reset to Default'),
                div('.row .s12', ['']),
            ])
        ).remember()

    const apply$ = sources.DOM.select('.apply').events('click')
    const reset$ = sources.DOM.select('.reset').events('click')

    const resetReducer$ = reset$
        .map(click => prevState => initSettings)
        .remember()

    return {
        DOM: vdom$,
        onion: xs.merge(
            resetReducer$,
            Settings.onion.compose(debounce(1000))
        ),
    };
}
