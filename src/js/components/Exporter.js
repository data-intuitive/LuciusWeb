import xs from "xstream"
import { div, a, i, ul, li, p, input, button } from "@cycle/dom"
import { loggerFactory } from "../utils/logger"
import delay from "xstream/extra/delay"

function intent(domSource$) {
  const modalTrigger$ = domSource$.select(".modal-open-btn").events("click")
  const modalCloseTrigger$ = domSource$.select(".export-close").events("click")

  return {
    modalTrigger$: modalTrigger$,
    modalCloseTrigger$: modalCloseTrigger$,
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

    // const modal = div("#modal-exporter.modal","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")

    const modal$ = //modalTrigger$.mapTo(modal).startWith(div())

    state$.map(state => div([
      div('#modal-exporter.modal', [
          div('.modal-content', [
              //
              div('.col .s12 .m6', [
                  p('.col .s12', ['Value for ', ' : ', 3, ' (doubling period ', ')']),
                  input('.mu .col .s12', { props: { type: 'range', min: 0, max: 30, step: 0.1, value: 3 }}),
              ]),
              div('.col  .s12 .m6', [
                  p('.col .s12', ['Value for ', ' : ', 4]),
                  input('.sigma .col .s12', { props: { type: 'range', min: 0, max: 5, step: 0.1, value: 4 }}),
              ]),
              div('.col .s12 .m6', [
                  p('.col .s12 ', ['Size of population: ', 10]),
                  input('.size .col .s12', { props: { type: 'range', min: 1, max: 500, step: 1 , value: 10 }}),
              ])
              //
          ]),
          div('.modal-footer', [
              button('.export-close .col .s8 .offset-s2 .btn .blue-grey', 'Close')
          ])
      ])])).startWith(div())

    const vdom$ = xs.combine(
      xs.of(fab),
      modal$
    )
    .map(([fab, modal]) => (div([fab, modal])))

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



  const openModal$ = actions.modalTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'open' })).debug("openModal$")
  const closeModal$ = actions.modalCloseTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'close' })).debug("closeModal$")


  return {
    log: xs.merge(logger(state$, "state$")),
    DOM: vdom$,
    onion: reducers$,
    fab: fabInit$,
    modal: xs.merge(openModal$, closeModal$)
  }
}

export {Exporter}