import {
  div,
  button,
} from "@cycle/dom"
import xs from "xstream"
import isolate from "@cycle/isolate"
import * as R from "ramda"
import debounce from "xstream/extra/debounce"
import dropRepeats from "xstream/extra/dropRepeats"

import { SettingsEditor } from "../components/SettingsEditor"

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
    {
      group: "config",
      title: "Configuration Settings",
      settings: [
        {
          field: "showAdminButton",
          type: "checkbox",
          class: ".switch",
          title: "Show Admin button?",
          props: { type: "checkbox" },
        },
        {
          field: "logoUrl",
          class: ".input-field",
          type: "text",
          title: "URL for logo image",
          props: {},
        },
        {
          field: "normalStatisticsResponseTime",
          class: ".input-field",
          type: "text",
          title: "Max normal time for statistics query",
          props: { type: "text" },
        }
      ],
    },
  ])

  const AdminSettings = SettingsEditor({...sources, settings$: settingsConfig$})

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
