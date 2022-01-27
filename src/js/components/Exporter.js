import xs from "xstream"
import { div, a, i, ul, li } from "@cycle/dom"
import { loggerFactory } from "../utils/logger"
import delay from "xstream/extra/delay"

function intent(domSource$) {

}

function model() {
    return xs.empty()
}

function view(state$) {

    // const placeholder = div(".red.lighten-4 .green-text.darken-4", "Exporter placeholder")
    const placeholder = div(".fixed-action-btn", [
        a(".btn-floating .btn-large .red", i(".large .material-icons", "share")),
        ul([
            li(a(".btn-floating .red", i(".material-icons", "link"))),
            li(a(".btn-floating .yellow.darken-1", i(".material-icons", "content_copy"))),
            li(a(".btn-floating .green", i(".material-icons", "picture_as_pdf"))),
            li(a(".btn-floating .blue", i(".material-icons", "open_with"))),
        ])
    ])

    return xs.of(placeholder)
}



function Exporter(sources) {


  const logger = loggerFactory(
    "exporter",
    sources.onion.state$,
    "settings.common.debug"
  )

  const state$ = sources.onion.state$

  const actions = intent(sources.DOM)

  const vdom$ = view(state$)

  const reducers$ = model()

  const fabInit$ = xs.of({
      state: "init",
      element: ".fixed-action-btn",
      options: {
          direction: "top",
        //   hoverEnabled: false,
      }
  }).compose(delay(1000)).remember()

  return {
    log: xs.merge(logger(state$, "state$")),
    DOM: vdom$,
    onion: reducers$,
    fab: fabInit$,
  }
}

export {Exporter}