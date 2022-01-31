import xs from "xstream"
import { div, a, i, ul, li, p, input, button, span } from "@cycle/dom"
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

function view(state$) {

    const fab = div(".fixed-action-btn", [
        span(".btn-floating .btn-large", i(".large .material-icons", "share")),
        ul([
            li(span(".btn-floating .export-link", i(".material-icons", "link"))),
            li(span(".btn-floating .export-copy", i(".material-icons", "content_copy"))),
            li(span(".btn-floating .export-pdf", i(".material-icons", "picture_as_pdf"))),
            li(span(".btn-floating .modal-open-btn", i(".material-icons", "open_with"))),
        ])
    ])

    const modal$ = state$.map(state => div([
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
              button('.export-close .col .s8 .offset-s2 .btn', 'Close')
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



  const openModal$ = actions.modalTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'open' }))
  const closeModal$ = actions.modalCloseTrigger$
    .map(_ => ({ el: '#modal-exporter', state: 'close' }))


  return {
    log: xs.merge(logger(state$, "state$")),
    DOM: vdom$,
    onion: reducers$,
    fab: fabInit$,
    modal: xs.merge(openModal$, closeModal$)
  }
}

export {Exporter}