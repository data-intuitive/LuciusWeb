import {
  div,
  label,
  input,
  button,
  h4,
  span,
  ul,
  li,
} from "@cycle/dom"
import xs from "xstream"
import isolate from "@cycle/isolate"
import { mergeWith, merge, props, keys, cond } from "ramda"
import * as R from "ramda"
import { pick, mix } from "cycle-onionify"
import debounce from "xstream/extra/debounce"
import dropRepeats from "xstream/extra/dropRepeats"

export function IsolatedAdminSettings(sources) {
  return isolate(AdminSettings, "settings")(sources)
}

export function AdminSettings(sources) {
  const settings$ = sources.onion.state$

  const settingsConfig$ = sources.deployments.map((deployments) => [
    {
      group: "deployment",
      title: "Deployment",
      settings: [
        {
          field: "name",
          type: "select",
          class: ".switch",
          title: "Deployment",
          options: deployments.map((x) => x.name),
          props: { type: "checkbox" },
        },
      ],
    },
    {
      group: "common",
      title: "Common Settings",
      settings: [
        {
          field: "version",
          type: "text",
          class: ".input-field",
          title: "API Version",
          props: { type: "text" },
        },
        {
          field: "debug",
          type: "checkbox",
          class: ".switch",
          title: "Debug App?",
          props: { type: "checkbox" },
        },
      ],
    },
    {
      group: "api",
      title: "API Settings",
      settings: [
        {
          field: "url",
          class: ".input-field",
          type: "text",
          title: "LuciusAPI URL",
          props: {},
        },
      ],
    },
    {
      group: "sourire",
      title: "Sourire Settings",
      settings: [
        {
          field: "url",
          class: ".input-field",
          type: "text",
          title: "Sourire URL",
          props: {},
        },
      ],
    },
    {
      group: "stats",
      title: "Statistics Settings",
      settings: [
        {
          field: "endpoint",
          class: ".input-field",
          type: "text",
          title: "Statistics URL",
          props: {},
        },
      ],
    },
    {
      group: "geneAnnotations",
      title: "Gene Annotation Settings",
      settings: [
        {
          field: "debug",
          type: "checkbox",
          class: ".switch",
          title: "Debug component?",
          props: { type: "checkbox" },
        },
        {
          field: "url",
          class: ".input-field",
          type: "text",
          title: "URL for Gene Annotations",
          props: {},
        },
      ],
    },
    {
      group: "treatmentAnnotations",
      title: "Treatment Annotation Settings",
      settings: [
        {
          field: "version",
          type: "text",
          class: ".input-field",
          title: "API Version",
          props: { type: "text" },
        },
        {
          field: "debug",
          type: "checkbox",
          class: ".switch",
          title: "Debug component?",
          props: { type: "checkbox" },
        },
        {
          field: "url",
          class: ".input-field",
          type: "text",
          title: "URL for Treatment Annotations",
          props: {},
        },
      ],
    },
    {
      group: "compoundTable",
      title: "Compound Table Settings",
      settings: [
        {
          field: "debug",
          type: "checkbox",
          class: ".switch",
          title: "Debug component?",
          props: { type: "checkbox" },
        },
      ],
    },
    {
      group: "headTable",
      title: "Top Table Settings",
      settings: [
        {
          field: "debug",
          type: "checkbox",
          class: ".switch",
          title: "Debug component?",
          props: { type: "checkbox" },
        },
      ],
    },
    {
      group: "tailTable",
      title: "Bottom Table Settings",
      settings: [
        {
          field: "debug",
          type: "checkbox",
          class: ".switch",
          title: "Debug component?",
          props: { type: "checkbox" },
        },
      ],
    },
    {
      group: "plots",
      title: "Combined (binned) plots",
      settings: [
        {
          field: "debug",
          type: "checkbox",
          class: ".switch",
          title: "Debug component?",
          props: { type: "checkbox" },
        },
      ],
    },
    {
      group: "form",
      title: "Form Settings",
      settings: [
        {
          field: "debug",
          type: "checkbox",
          class: ".switch",
          title: "Debug component?",
          props: { type: "checkbox" },
        },
      ],
    },
    {
      group: "filter",
      title: "Filter Settings",
      settings: [
        {
          field: "debug",
          type: "checkbox",
          class: ".switch",
          title: "Debug component?",
          props: { type: "checkbox" },
        },
      ],
    },
  ])

  // Depending on the type of config settings, render the appropriate vdom representation
  function renderField(config, _state) {
    if (config.type == "checkbox") {
      return [
        label(".active", [
          input({ props: merge(config.props, { checked: _state }) }),
          span(".lever"),
        ]),
      ]
    }
    if (config.type == "text") {
      return [input({ props: merge(config.props, { value: _state }) })]
    }
    if (config.type == "select") {
      const options = config.options
      const selectedOption = (option) =>
        _state == option
          ? ".grey.lighten-3.black-text"
          : ".grey.lighten-3.grey-text.text-lighten-1"
      const optionButtons = options.map((o) =>
        div(
          ".col.selection" + selectedOption(o) + "." + o,
          { style: { "border-style": "solid", margin: "2px" } },
          [
            label(selectedOption(o), [
              input("", { props: merge(config.props, { value: o }) }, ""),
              o,
            ]),
          ]
        )
      )
      return optionButtons
    }
  }

  const makeSetting = (config) => (sources) => {
    const state$ = sources.onion.state$

    const update$ = R.cond([
      [
        R.equals("checkbox"),
        (_) =>
          sources.DOM.select("input")
            .events("click")
            .map((event) => event),
      ],
      [
        R.equals("text"),
        (_) => sources.DOM.events("input").map((event) => event.target.value),
      ],
      [
        R.equals("select"),
        (_) =>
          sources.DOM.select("input")
            .events("click")
            .map((event) => event.target.value),
      ],
    ])(config.type)

    const vdom$ = state$.map((state) =>
      li(
        ".collection-item .row",
        div(".valign-wrapper", [
          span(".col .l6 .s12 .truncate", [
            span(".flow-text", [config.title]),
            span(["  "]),
            span(".grey-text .text-lighten-1 .right-align", [
              "(",
              state.toString(),
              ")",
            ]),
          ]),

          div(".col .s6 " + config.class, renderField(config, state)),
        ])
      )
    )

    const updateReducer$ = cond([
      [
        R.equals("checkbox"),
        (_) => update$.map((_) => (prevState) => !prevState),
      ],
      [R.equals("text"), (_) => update$.map((update) => (_) => update)],
      [
        R.equals("select"),
        (_) => update$.map((update) => (_) => update),
      ],
    ])(config.type)

    return {
      DOM: vdom$,
      onion: updateReducer$,
    }
  }

  const makeSettingsGroup = (settingsGroupObj) => (sources) => {
    const group$ = sources.onion.state$
    const settingsArray = settingsGroupObj.settings
    const title = settingsGroupObj.title

    const components$ = xs
      .of(settingsArray)
      .map((settings) =>
        settings.map((setting) =>
          isolate(makeSetting(setting), setting.field)(sources)
        )
      )
      .remember()

    const vdom$ = components$
      .compose(pick("DOM"))
      .compose(mix(xs.combine))
      .map((vdoms) =>
        ul(
          ".collection .with-header",
          [li(".collection-header .grey .lighten-2", [h4(title)])].concat(vdoms)
        )
      )
      .remember()

    const reducer$ = components$.compose(pick("onion")).compose(mix(xs.merge))

    return {
      onion: reducer$,
      DOM: vdom$,
    }
  }

  const makeSettings = (settingsConf$, sources) => {
    const settings$ = sources.onion.state$

    const groups$ = settingsConf$
      .map((groups) =>
        groups.map((group) =>
          isolate(makeSettingsGroup(group), group.group)(sources)
        )
      )
      .remember()

    const vdom$ = groups$
      .compose(pick("DOM"))
      .compose(mix(xs.combine))
      .map((vdoms) => div(".col .l8 .offset-l2 .s12", vdoms))
      .remember()

    const reducer$ = groups$
      .compose(pick("onion"))
      .compose(mix(xs.merge))
      .remember()

    return {
      onion: reducer$,
      DOM: vdom$,
    }
  }

  const AdminSettings = makeSettings(settingsConfig$, sources)

  const vdom$ = xs
    .combine(settings$, AdminSettings.DOM)
    .map(([_, topTableEntries]) =>
      div(".row .grey .lighten-3", { style: { margin: "0px 0px 0px 0px" } }, [
        div(".row .s12", [""]),
        topTableEntries,
        div(".row .s12", [""]),
        button(".reset .col .s4 .offset-s4 .btn .grey", "Reset to Default"),
        div(".row .s12", [""]),
      ])
    )
    .remember()

  // const apply$ = sources.DOM.select('.apply').events('click')
  const reset$ = sources.DOM.select(".reset").events("click").remember()

  // Reset the storage by removing the ComPass key
  const resetStorage$ = reset$.mapTo({ action: "removeItem", key: "ComPass" })

  // The router does not reload the same page, so use the browser functionality for that...
  const router$ = reset$
    .map((_) => location.reload())
    .mapTo("/admin")
    .remember()

  // Deployment needs to be tackled globally, does not work in _isolation_
  const deploymentUpdated$ = settings$.compose(
    dropRepeats((x, y) => x.deployment.name == y.deployment.name)
  )

  // Just like in index.js:
  // - fetch the appropriate deployment from deployments.js
  // - overwrite the relevant entries (endpoints) of the various settings with the correct one
  //
  // TODOs:
  // - align this with index.js
  // - restructure deployments.js to an array of deployments rather than a hashmap
  const deploymentReducer$ = xs
    .combine(deploymentUpdated$, sources.deployments)
    .map(([settings, deployments]) => (prevState) => {
      const desiredDeploymentName = settings.deployment.name
      const desiredDeployment = R.head(
        deployments.filter((x) => x.name == desiredDeploymentName)
      )
      const updatedDeployment = R.mergeDeepRight(
        prevState.deployment,
        desiredDeployment
      )
      const updatedSettings = R.merge(prevState, {
        deployment: updatedDeployment,
      })
      const distributedAdminSettings = R.mergeDeepRight(
        updatedSettings,
        updatedSettings.deployment.services
      )
      console.log(desiredDeploymentName)
      return distributedAdminSettings
    })

  return {
    DOM: vdom$,
    onion: xs.merge(
      deploymentReducer$.compose(debounce(50)),
      AdminSettings.onion.compose(debounce(200))
    ),
    router: router$,
    storage: resetStorage$,
  }
}
