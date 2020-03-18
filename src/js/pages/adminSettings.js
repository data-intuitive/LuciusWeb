import { a, div, br, label, input, p, button, code, pre, h2, h4, i, h3, h5, span, ul, li } from '@cycle/dom'
import xs from 'xstream'
import isolate from '@cycle/isolate'
import { mergeWith, merge, mergeAll } from 'ramda'
import { clone } from 'ramda';
import sampleCombine from 'xstream/extra/sampleCombine'
import { initSettings } from '../configuration.js'
import { pick, mix } from 'cycle-onionify';
import debounce from 'xstream/extra/debounce'

export function IsolatedAdminSettings(sources) {
    return isolate(AdminSettings, 'settings')(sources)
}

export function AdminSettings(sources) {

    const settings$ = sources.onion.state$

    const settingsConfig = [{
            group: 'common',
            title: 'Common Settings',
            settings: [{
                    field: 'version',
                    type: 'text',
                    class: '.input-field',
                    title: 'API Version',
                    props: { type: 'text' }
                },
                {
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug App?',
                    props: { type: 'checkbox' }
                }
            ]
        },
        {
            group: 'api',
            title: 'API Settings',
            settings: [{
                field: 'url',
                class: '.input-field',
                type: 'text',
                title: 'LuciusAPI URL',
                props: {}
            }]
        },
        {
            group: 'sourire',
            title: 'Sourire Settings',
            settings: [{
                field: 'url',
                class: '.input-field',
                type: 'text',
                title: 'Sourire URL',
                props: {}
            }]
        },
        {
            group: 'stats',
            title: 'Statistics Settings',
            settings: [{
                field: 'endpoint',
                class: '.input-field',
                type: 'text',
                title: 'Statistics URL',
                props: {}
            }]
        },
        {
            group: 'geneAnnotations',
            title: 'Gene Annotation Settings',
            settings: [{
                field: 'debug',
                type: 'checkbox',
                class: '.switch',
                title: 'Debug component?',
                props: { type: 'checkbox' }
            }, {
                field: 'url',
                class: '.input-field',
                type: 'text',
                title: 'URL for Gene Annotations',
                props: {}
            }]
        },
      {
        group: 'compoundAnnotations',
        title: 'Compound Annotation Settings',
        settings: [
        {
          field: 'version',
          type: 'text',
          class: '.input-field',
          title: 'API Version',
          props: { type: 'text' }
        },
        {
          field: 'debug',
          type: 'checkbox',
          class: '.switch',
          title: 'Debug component?',
          props: { type: 'checkbox' }
        },
        {
          field: 'url',
          class: '.input-field',
          type: 'text',
          title: 'URL for Compound Annotations',
          props: {}
        }]
      },
        {
            group: 'compoundTable',
            title: 'Compound Table Settings',
            settings: [{
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug component?',
                    props: { type: 'checkbox' }
                }
            ]
        },
        {
            group: 'headTable',
            title: 'Top Table Settings',
            settings: [{
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug component?',
                    props: { type: 'checkbox' }
                }
            ]
        },
        {
            group: 'tailTable',
            title: 'Bottom Table Settings',
            settings: [{
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug component?',
                    props: { type: 'checkbox' }
                }
            ]
        },
        {
            group: 'plots',
            title: 'Combined (binned) plots',
            settings: [{
                    field: 'debug',
                    type: 'checkbox',
                    class: '.switch',
                    title: 'Debug component?',
                    props: { type: 'checkbox' }
                }
            ]
        },
        {
            group: 'form',
            title: 'Form Settings',
            settings: [{
                field: 'debug',
                type: 'checkbox',
                class: '.switch',
                title: 'Debug component?',
                props: { type: 'checkbox' }
            }]
        },
        {
            group: 'filter',
            title: 'Filter Settings',
            settings: [{
                field: 'debug',
                type: 'checkbox',
                class: '.switch',
                title: 'Debug component?',
                props: { type: 'checkbox' }
            }]
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

    const AdminSettings = makeSettings(settingsConfig)(sources)

    const vdom$ = xs.combine(settings$, AdminSettings.DOM)
        .map(([_, topTableEntries]) =>
            div('.row .grey .lighten-3', { style: { margin: '0px 0px 0px 0px' } }, [
                div('.row .s12', ['']),
                topTableEntries,
                div('.row .s12', ['']),
                button('.reset .col .s4 .offset-s4 .btn .grey', 'Reset to Default'),
                div('.row .s12', ['']),
            ])
        ).remember()

    // const apply$ = sources.DOM.select('.apply').events('click')
    const reset$ = sources.DOM.select('.reset').events('click').remember()

    // Reset the storage by removing the ComPass key
    const resetStorage$ = reset$.mapTo({ action: "removeItem", key : "ComPass"})

    // The router does not reload the same page, so use the browser functionality for that...
    const router$ = reset$.map(_ => location.reload()).mapTo('/admin').remember()

    return {
        DOM: vdom$,
        onion: AdminSettings.onion.compose(debounce(200)),
        router: router$,
        storage: resetStorage$
    }
}
