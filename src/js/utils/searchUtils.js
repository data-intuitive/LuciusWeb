import xs from "xstream"
import flattenConcurrently from "xstream/extra/flattenConcurrently"
import delay from "xstream/extra/delay"
import dropRepeats from "xstream/extra/dropRepeats"
import { prop, equals, min, max } from "ramda"

/**
 * Create stream with text to be used as input
 * @function typer
 * @param {Stream} state$ full state onion of the component
 * @param {String} valueName name of the property in the state to be used; search value
 * @param {String} speedName name of the property in the state to be used; enables slow typing
 * @returns Stream
 */
export function typer(state$, valueName, speedName) {
  /**
   * Get the search value from state$
   * @const typer/value$
   * @type {Stream}
   */
  const value$ = state$
    .map((state) => prop(valueName, state))
    .filter((value) => value !== undefined)
    .compose(dropRepeats(equals))
    .compose(delay(100))

  /**
   * Get the typer speed from state$
   * @const typer/speed$
   * @type {Stream}
   */
  const speed$ = state$
    .map((state) => prop(speedName, state))
    .compose(dropRepeats(equals))
    .startWith("")

  /**
   * Slowly type the search value, starting with 1 letter and incrementally getting longer until the full text is being output
   * Only used when speed is explicitely set
   * @const typer/typer$
   * @type {Stream}
   */
  const typer$ = xs
    .combine(speed$, value$)
    .filter(([speed, _]) => speed == "" || speed == "yes" || !isNaN(speed))
    .map(([speed, value]) => {
      const l = value.length
      const range = Array(l)
        .fill()
        .map((_, index) => index + 1)

      const interval = isNaN(speed) ? 100 : max(min(speed, 5000), 50)

      return xs
        .fromArray(
          range.map((i) =>
            xs.of(value.substr(0, i)).compose(delay(interval * i))
          )
        )
        .compose(flattenConcurrently)
    })
    .flatten()

  /**
   * Output search value in one go if the typer isn't enabled by the speed value
   * @const typer/typerNotSelected$
   * @type {Stream}
   */
  const typerNotSelected$ = xs
    .combine(speed$, value$)
    .filter(
      ([speed, _]) =>
        speed == undefined || (speed != "" && speed != "yes" && isNaN(speed))
    )
    .map(([_, value]) => value)

  return xs.merge(typer$, typerNotSelected$)
}
