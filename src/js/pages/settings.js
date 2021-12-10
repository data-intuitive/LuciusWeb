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
import { mergeWith, merge, mergeAll } from "ramda"
import { pick, mix } from "cycle-onionify"
import debounce from "xstream/extra/debounce"

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
   * Display field setting, rendered according config.type
   * @const Settings/makeSetting
   * @param {Object} config description how the field should be displayed and options of e.g. minimum and maximum values
   *    'type'    text field determining how the value will be displayed, text, checkbox or range
   *    'class'   identifier for the field vdom div
   *    'title'   is text displayed on the page for this field
   *    'options' possible values for a multiple choice field
   *    'props'   extra properties to pass to the input field
   * @returns Object with
   *            - onion: reducer to update the value to the new set value
   *            - DOM: vdom stream of li and sub-elements
   * @type {Object}
   */
  const makeSetting = (config) => (sources) => {
    const state$ = sources.onion.state$

    /**
     * Stream of DOM updates, clicks for checkboxes or the new value for other input types
     * @const Settings/makeSetting/update$
     * @type {Stream}
     */
    const update$ =
      config.type == "checkbox"
        ? sources.DOM.select("input")
            .events("click")
            .map((event) => event)
        : sources.DOM.events("input").map((event) => event.target.value)

    /**
     * @function Settings/makeSetting/renderField
     * @param {Object} config description how the input field should be rendered or what options to give
     *    'type'    text field determining how the value will be displayed, text, checkbox or range
     *    'options' possible values for a multiple choice field
     *    'props'   extra properties to pass to the input field
     * @param {*} _state current value of the field
     * @returns vdom element according specification in config
     */ 
    function renderField(config, _state) {
      if (config.type == "checkbox") {
        return [
          label(".active", [
            input({ props: merge(config.props, { checked: _state }) }),
            span(".lever"),
          ]),
        ]
      }
      if (config.type == "text" || config.type == "range") {
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

    /**
     * Display field with title, value and input field depending on config
     * @const Settings/makeSetting/vdom$
     * @type {Stream}
     */
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

          div(
            ".col .s6 " + config.class,
            renderField(config, state)
          ),
        ])
      )
    )

    /**
     * Conditional reducer depending on field type
     * @const Settings/makeSetting/updateReducer$
     * @type {Reducer}
     */
    const updateReducer$ =
      config.type == "checkbox"
        ? update$.map((_) => (prevState) => !prevState)
        : update$.map((update) => (_) => update)

    return {
      DOM: vdom$,
      onion: updateReducer$,
    }
  }

  /**
   * Perform sanity check before calling isolate(makeSetting(...),...)
   * If we detect that the required member value is not present in onionified state, 
   *    display static vdom with an error message instead.
   * If isolate is called without the passed member is present in the onionified state, 
   *    the whole system breaks down and we end up with an empty page without any error messages being displayed,
   *    making it quite difficult to debug what setting is wrong.
   * @const Settings/safelyMakeSetting$
   * @param {Object} config description how the field should be displayed and options of e.g. minimum and maximum values
   *    'field'   has to match to the member name in state$ -> setting.'group'.'field'
   *    'type'    text field determining how the value will be displayed, text, checkbox or range
   *    'class'   identifier for the field vdom div
   *    'title'   is text displayed on the page for this field
   *    'options' possible values for a multiple choice field
   *    'props'   extra properties to pass to the input field
   * @param {Stream} sources onionified state for the group this setting is in, and to be further onionified
   * @returns Stream of Object with
   *            - onion: reducer to update the value to the newly set value
   *            - DOM: vdom stream of li and sub-elements
   * @type {Stream(Object)}
   */
  const safelyMakeSetting$ = (config, sources) => {
    /**
     * Minimalistic vdom to be displayed when a field can't be found in the sources
     * Mimics same member values as MakeSettings so they can be combined later
     *    - DOM:   stream of fixed vdom li
     *    - onion: empty stream instead of reducers
     * @const Settings/safelyMakeSetting$/missingFieldVdom
     * @type {Object}
     */
    const missingFieldVdom = {
        DOM: xs.of(
          li(".collection-item .row",
            div(".valign-wrapper", [
              span(".col .l6 .s12 .truncate .flow-text", [config.title]),
              span(".col .s6 .red-text", ["No value '" + config.field + "' in configuration"]),
            ])
          )),
        onion: xs.empty()
      }

    /**
     * Stream of either isolated MakeSetting in case field is found in state$ or static vdom in case field is missing in state$
     * @const Settings/safelyMakeSetting$/vdom$
     * @type {Stream(Object)}
     */
    const vdom$ = sources.onion.state$
      .map((state) => (
          (config.field in state) ?
            isolate(makeSetting(config), config.field)(sources) :
            missingFieldVdom
        )
    )
    return vdom$
  }

  /**
   * Display group header and create line of each field with name and input field
   * @const Settings/settingsGroupObj
   * @param {Object} settingsGroupObj Information how the group should be displayed:
   *            - title: Name to be displayed
   *            - settings: Array of Objects for fields to be displayed
   * @returns Object with
   *            - onion: reducers to update the field values to the newly set values
   *            - DOM: vdom stream of ul and sub-elements
   */
  const makeSettingsGroup = (settingsGroupObj) => (sources) => {
    const settingsArray = settingsGroupObj.settings
    const title = settingsGroupObj.title

    /**
     * Convert array of field settings to stream of objects contains DOM and reducers
     * @const Settings/settingsGroupObj/components$
     */
    const components$ = xs.of(settingsArray)
      .map((settings) =>
        settings.map((setting) =>
            safelyMakeSetting$(setting, sources)
        )
      )
      .compose(mix(xs.combine))
      .remember()

    /**
     * Combines all vdoms from the group field components and adds a title above them
     * @const Settings/settingsGroupObj/vdom$
     * @type {MemoryStream}
     */
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

    /**
     * Combines all reducer streams from the group field components
     * @const Settings/settingsGroupObj/reducer$
     * @type {Stream}
     */
    const reducer$ = components$.compose(pick("onion")).compose(mix(xs.merge))

    return {
      onion: reducer$,
      DOM: vdom$,
    }
  }
  /**
   * Perform sanity check before calling isolate(makeSettingsGroup(...),...)
   * If we detect that the required group value is not present in onionified state, 
   *    display static vdom with an error message instead.
   * If isolate is called without the passed member is present in the onionified state, 
   *    the whole system breaks down and we end up with an empty page without any error messages being displayed,
   *    making it quite difficult to debug what setting is wrong.
   * @const Settings/safelyMakeSettingsGroup$
   * @param {Object} group description how the group should be displayed
   *            - 'group' has to match to the member name in state$ -> settings.'group'
   *            - 'title' is text displayed on the page for this group
   *            - 'settings' contains information for each nested field
   * @param {Stream} sources onionified state of settings, and to be further onionified
   * @returns Stream of Object with
   *            - onion: reducers to update the field values to the newly set values
   *            - DOM: vdom stream of ul and sub-elements
   * @type {Stream(Object)}
   */
  const safelyMakeSettingsGroup$ = (group, sources) => {
    /**
     * Minimalistic vdom to be displayed when a group can't be found in the sources
     * Mimics same member values as MakeSettingsGroup so they can be combined later
     *    - DOM:   stream of fixed vdom ul
     *    - onion: empty stream instead of reducers
     * @const Settings/safelyMakeSettingsGroup$/missingGroupVdom
     * @type {Object}
     */
    const missingGroupVdom = {
        DOM: xs.of(
          ul(
            ".collection .with-header",
            [
              li(".collection-header .grey .lighten-2", [h4(group.title)]), 
              span(".col .s6 .red-text", ["No value '" + group.group + "' in configuration"]),
            ]
          )),
        onion: xs.empty()
      }

    /**
     * Stream of either isolated MakeSettingsGroup in case group is found in state$ or static vdom in case group is missing in state$
     * @const Settings/safelyMakeSettingsGroup$/vdom$
     * @type {Stream(Object)}
     */
    const vdom$ = sources.onion.state$
      .map((state) => (
        (group.group in state) ?
          isolate(makeSettingsGroup(group), group.group)(sources) :
          missingGroupVdom
      )
    )
    return vdom$
  }

  const makeSettings = (settingsObj) => (sources) => {

    const groups$ = xs.of(settingsObj)
      .map((groups) =>
        groups.map((group) =>
          safelyMakeSettingsGroup$(group, sources)
        )
      )
      .compose(mix(xs.combine))
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

  const Settings = makeSettings(settingsConfig)(sources)

  const vdom$ = xs
    .combine(settings$, Settings.DOM)
    .map(([_, topTableEntries]) =>
      div(".row .grey .lighten-3", { style: { margin: "0px 0px 0px 0px" } }, [
        div(".row .s12", [""]),
        topTableEntries,
        div(".row .s12", [""]),
        button(".reset .col .s2 .offset-s3 .btn .grey", "Reset to Default"),
        button(
          ".admin .col .s2 .offset-s2 .btn .grey .lighten-2 .grey-text",
          "Go to Admin Settings"
        ),
        div(".row .s12", [""]),
      ])
    )
    .remember()

  // When the reset button is pressed, we remove the ComPass key from the local storage
  // and reload the page. The `defaultReducer$` in `index.js` handles taking care of
  // the deployment scenario.
  const reset$ = sources.DOM.select(".reset").events("click").remember()
  // Reset the storage by removing the ComPass key
  const resetStorage$ = reset$.mapTo({ action: "removeItem", key: "ComPass" })

  const admin$ = sources.DOM.select(".admin").events("click").remember()

  // The router does not reload the same page, so use the browser functionality for that...
  const resetRouter$ = reset$
    .map((_) => location.reload())
    .mapTo("/settings")
    .remember()
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
