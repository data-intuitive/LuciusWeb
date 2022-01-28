import xs from "xstream"
import { div, a, i, ul, li } from "@cycle/dom"
import { loggerFactory } from "../utils/logger"
import delay from "xstream/extra/delay"

function intent(domSource$) {
  const modalTrigger$ = domSource$.select(".modal-open-btn").events("click")//.debug("modalTrigger$").remember()

  return {
    modalTrigger$: modalTrigger$,
  }
}

function model() {
  
    return xs.empty()
}

function view(state$, modalTrigger$) {

    const fab = div(".fixed-action-btn", [
        a(".btn-floating .btn-large .red", i(".large .material-icons", "share")),
        ul([
            li(a(".btn-floating .red", i(".material-icons", "link"))),
            li(a(".btn-floating .yellow.darken-1", i(".material-icons", "content_copy"))),
            li(a(".btn-floating .green", i(".material-icons", "picture_as_pdf"))),
            li(a(".btn-floating .blue .modal-open-btn", i(".material-icons", "open_with"))),
        ])
    ])

    const modal = div("#modal-exporter","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

    const modal$ = modalTrigger$.mapTo(modal).startWith(div())

    const vdom$ = xs.combine(
      xs.of(fab),
      modal$
    )
    .map(([fab, modal]) => (div(".col",[fab, modal])))

    return vdom$
}



function Exporter(sources) {


  const logger = loggerFactory(
    "exporter",
    sources.onion.state$,
    "settings.common.debug"
  )

  const state$ = sources.onion.state$

  const actions = intent(sources.DOM)

  const vdom$ = view(state$, actions.modalTrigger$)

  const reducers$ = model()

  const fabInit$ = xs.of({
      state: "init",
      element: ".fixed-action-btn",
      options: {
          direction: "top",
        //   hoverEnabled: false,
      }
  }).compose(delay(1000)).remember()


  const modalTrigger$ = sources.DOM.select(".modal-open-btn").events("click").remember()

  const openModal$ = modalTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'open' }))

  return {
    log: xs.merge(logger(state$, "state$")),
    DOM: vdom$,
    onion: reducers$,
    fab: fabInit$,
    modal: openModal$
  }
}

export {Exporter}