import {
  div,
  button,
} from "@cycle/dom"
import xs from "xstream"
import isolate from "@cycle/isolate"
import { mergeWith, merge, mergeAll } from "ramda"
import { pick, mix } from "cycle-onionify"
import debounce from "xstream/extra/debounce"

import { SettingsEditor } from "../components/SettingsEditor"

/**
 * @module pages/Settings
 */

/**
 * Isolate the Settings component/page
 * @function IsolatedSettings
 * @param {Stream} sources
 * @returns Isolated Settings component/page
 */
export function IsolatedSettings(sources) {
  return isolate(Settings, "settings")(sources)
}

/**
 * Create a component/page that allows configuring the application
 * @function Settings
 * @param {Stream} sources
 * @returns Settings component/page
 */
export function Settings(sources) {
  const settings$ = sources.onion.state$

  /**
   * Settings to display on the page
   * 'group' has to match to the member name in state$ -> settings.'group'
   * 'title' is text displayed on the page for this group
   * 'settings' contains information for each nested field
   *    'field'   has to match to the member name in state$ -> setting.'group'.'field'
   *    'type'    text field determining how the value will be displayed, text, checkbox or range
   *    'class'   identifier for the field vdom div
   *    'title'   is text displayed on the page for this field
   *    'options' possible values for a multiple choice field
   *    'props'   extra properties to pass to the input field
   * @const Settings/settingsConfig
   * @type {Array(Object)}
   */
  const settingsConfig = [
    {
      group: "common",
      title: "Common Settings",
      settings: [
        {
            field: 'ghostMode',
            type: 'checkbox',
            class: '.switch',
            title: 'Ghost Mode',
            props: { type: 'checkbox' }
        },
        {
          field: "pvalue",
          class: ".input-field",
          type: "text",
          title: "p-value",
          props: { type: "text" },
        },
        {
          field: "blur",
          class: ".switch",
          type: "checkbox",
          title: "Blur?",
          props: { type: "checkbox" },
        },
        {
          field: "amountBlur",
          class: ".range-field",
          type: "range",
          title: "Amount blur?",
          props: { type: "range", min: 0, max: 10 },
        },
      ],
    },
    {
      group: "compoundTable",
      title: "Compound Table Settings",
      settings: [
        {
          field: "count",
          class: ".range-field",
          type: "range",
          title: "# of entries in table",
          props: { type: "range", min: 0, max: 100 },
        },
      ],
    },
    {
      group: "headTable",
      title: "Top Table Settings",
      settings: [
        {
          field: "count",
          class: ".range-field",
          type: "range",
          title: "# of entries in table",
          props: { type: "range", min: 0, max: 20 },
        },
      ],
    },
    {
      group: "tailTable",
      title: "Bottom Table Settings",
      settings: [
        {
          field: "count",
          class: ".range-field",
          type: "range",
          title: "# of entries in table",
          props: { type: "range", min: 0, max: 20 },
        },
      ],
    },
    {
      group: "plots",
      title: "Combined (binned) plots",
      settings: [
        {
          field: "displayPlots",
          type: "select",
          class: ".switch",
          title: "Display plots?",
          options: ["before tables", "after tables", "no"],
          props: { type: "checkbox" },
        },
        {
          field: "bins",
          class: ".range-field",
          type: "range",
          title: "# of bins in Histogram and Y-direction",
          props: { type: "range", min: 5, max: 50 },
        },
        {
          field: "binsX",
          class: ".range-field",
          type: "range",
          title: "# of bins in X direction",
          props: { type: "range", min: 5, max: 50 },
        },
      ],
    },
  ]

  /**
   * SettingsConfig object converted to vdom object and reducers streams
   * @const Settings/Settings
   * @type {Object}
   */
  const Settings = SettingsEditor({...sources, settings$: xs.of(settingsConfig)})

  const buttons$ = settings$
    .map((state) => 
      state.config.showAdminButton ?
        div([
          button(".reset .col .s4 .offset-s1 .l2 .offset-l3 .btn .grey", "Reset to Default"),
          button(
            ".admin .col .s4 .l2 .offset-s1 .offset-l2 .btn .grey .lighten-2 .grey-text",
            "Go to Admin Settings"
            )
        ]) :
        div([
          button(".reset .col .s4 .offset-s4 .btn .grey", "Reset to Default"),
        ])
      )

  const vdom$ = xs
    .combine(settings$, Settings.DOM, buttons$)
    .map(([_, dom, buttons]) =>
      div(".row .grey .lighten-3", { style: { margin: "0px 0px 0px 0px" } }, [
        div(".row .s12", [""]),
        dom,
        div(".row .s12", [""]),
        buttons,
        div(".row .s12", [""]),
      ])
    )
    .remember()


  /**
   * Listener stream for reset button presses
   * When the reset button is pressed, we remove the ComPass key from the local storage
   * and reload the page. The `defaultReducer$` in `index.js` handles taking care of
   * the deployment scenario.
   * @const Settings/reset$
   * @type {MemoryStream}
   */
  const reset$ = sources.DOM.select(".reset").events("click").remember()

  /**
   * Reset the storage by removing the ComPass key
   * @const Settings/resetStorage$
   * @type {Stream}
   */
  const resetStorage$ = reset$.mapTo({ action: "removeItem", key: "ComPass" })

  /**
   * Listener stream for admin button presses
   * Sends router to the /settings page
   * @const Settings/admin$
   * @type {MemoryStream}
   */
  const admin$ = sources.DOM.select(".admin").events("click").remember()

  /**
   * The router does not reload the same page, so use the browser functionality for that...
   * @const Settings/resetRouter$
   * @type {MemoryStream}
   */
  const resetRouter$ = reset$
    .map((_) => location.reload())
    .mapTo("/settings")
    .remember()

  /**
   * Trigger router to load the /admin page
   * @const Settings/adminRouter$
   * @type {MemoryStream}
   */
  const adminRouter$ = admin$.mapTo("/admin").remember()

  // This is an effect and should be moved to a driver...
  // TODO
  // const reload$ = xs.merge(resetRouter$, adminRouter$).compose(debounce(20)).map(_ => location.reload())

  return {
    DOM: vdom$,
    onion: Settings.onion.compose(debounce(200)),
    router: xs.merge(resetRouter$, adminRouter$),
    storage: resetStorage$,
  }

}
