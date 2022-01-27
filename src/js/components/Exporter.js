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
    const placeholder = div(".fixed-action-button", [
        a(".btn-floating .btn-large .red", i(".large .material-icons", "mode_edit")),
        ul([
            li(a(".btn-floating .red", i(".material-icons", "insert_chart"))),
            li(a(".btn-floating .yellow.darken-1", i(".material-icons", "format_quote"))),
            li(a(".btn-floating .green", i(".material-icons", "publish"))),
            li(a(".btn-floating .blue", i(".material-icons", "attach_file"))),
        ])
    ])

//     <div class="fixed-action-btn">
//   <a class="btn-floating btn-large red">
//     <i class="large material-icons">mode_edit</i>
//   </a>
//   <ul>
//     <li><a class="btn-floating red"><i class="material-icons">insert_chart</i></a></li>
//     <li><a class="btn-floating yellow darken-1"><i class="material-icons">format_quote</i></a></li>
//     <li><a class="btn-floating green"><i class="material-icons">publish</i></a></li>
//     <li><a class="btn-floating blue"><i class="material-icons">attach_file</i></a></li>
//   </ul>
// </div>

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
      element: ".fixed-action-button",
      options: {
          direction: "left",
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