import {
    div,
    label,
    input,
    h4,
    span,
    ul,
    li,
  } from "@cycle/dom"
  import xs from "xstream"
  import isolate from "@cycle/isolate"
  import { mergeRight } from "ramda"
  import { pick, mix } from "cycle-onionify"

/**
 * @module components/SettingsEditor
 */

/**
   * Generate a component to display and edit settings
   * @function SettingsEditor
   * @param {*} sources 
   *          - onion.state$: default onion atom
   *          - DOM: DOM events
   *          - settings$: Stream containing top level object array containing group and field information
   *            - 'group' has to match to the member name in state$ -> settings.'group'
   *            - 'title' is text displayed on the page for this group
   *            - 'settings' contains information for each nested field
   *              - 'field'   has to match to the member name in state$ -> setting.'group'.'field'
   *              - 'type'    text field determining how the value will be displayed, text, checkbox or range
   *              - 'class'   identifier for the field vdom div
   *              - 'title'   is text displayed on the page for this field
   *              - 'options' possible values for a multiple choice field
   *              - 'props'   extra properties to pass to the input field
   * @returns  
   *          - onion: reducers to update the field values to the newly set values
   *          - DOM: vdom stream of ul and sub-elements
   */
export function SettingsEditor(sources) {

  const settings$ = sources.settings$

  /**
   * Display field setting, rendered according config.type
   * @const SettingsEditor/makeSetting
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
     * @const SettingsEditor/makeSetting/update$
     * @type {Stream}
     */
    const update$ =
      config.type == "checkbox"
        ? sources.DOM.select("input")
            .events("click")
            .map((event) => event)
        : sources.DOM.events("input").map((event) => event.target.value)

    /**
     * @function SettingsEditor/makeSetting/renderField
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
            input({ props: mergeRight(config.props, { checked: _state }) }),
            span(".lever"),
          ]),
        ]
      }
      if (config.type == "text" || config.type == "range") {
        return [input({ props: mergeRight(config.props, { value: _state }) })]
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
                input("", { props: mergeRight(config.props, { value: o }) }, ""),
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
     * @const SettingsEditor/makeSetting/vdom$
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
     * @const SettingsEditor/makeSetting/updateReducer$
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
   * @const SettingsEditor/safelyMakeSetting$
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
     * @const SettingsEditor/safelyMakeSetting$/missingFieldVdom
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
     * @const SettingsEditor/safelyMakeSetting$/vdom$
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
   * @const SettingsEditor/settingsGroupObj
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
     * @const SettingsEditor/settingsGroupObj/vdom$
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
     * @const SettingsEditor/settingsGroupObj/reducer$
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
   * @const SettingsEditor/safelyMakeSettingsGroup$
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
     * @const SettingsEditor/safelyMakeSettingsGroup$/missingGroupVdom
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
     * @const SettingsEditor/safelyMakeSettingsGroup$/vdom$
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

  /**
   * Convert groups to vdom and reducer objects
   * Do this safely instead of just calling isolate(group, group.group) directly
   * If the group is not present in the sources state onion, things go bad and we end up with a blank page
   * @const SettingsEditor/groups$
   * @type {MemoryStream}
   */
  const groups$ = settings$
      .map((groups) =>
        groups.map((group) =>
            safelyMakeSettingsGroup$(group, sources)
          )
      )
      .compose(mix(xs.combine))
      .remember()

  /**
   * Stream of group vdom div
   * @const SettingsEditor/vdom$
   * @type {MemoryStream}
   */
  const vdom$ = groups$
      .compose(pick("DOM"))
      .compose(mix(xs.combine))
      .map((vdoms) => div(".col .l8 .offset-l2 .s12", vdoms))
      .remember()

  /**
   * Steam of reducers
   * @const SettingsEditor/reducer$
   * @type {MemoryStream}
   */
  const reducer$ = groups$
      .compose(pick("onion"))
      .compose(mix(xs.merge))
      .remember()

  return {
    onion: reducer$,
    DOM: vdom$,
  }
  
}