import xs from "xstream"
import { div, p, span } from "@cycle/dom"
import { loggerFactory } from "../utils/logger"

/**
 * @module components/RoutingConfirmation
 */

/**
 * Get triggers from button presses in the DOM
 * @function intent
 * @param {*} domSource$ 
 * @returns object containing trigger streams
 */
function intent(domSource$) {
  const modalTrigger$ = domSource$.select(".routingConfirmation-show").events("click")
  const modalStayTrigger$ = domSource$.select(".routingConfirmation-stay").events("click")
  const modalSwitchTrigger$ = domSource$.select(".routingConfirmation-switch").events("click")

  return {
    modalTrigger$: modalTrigger$,
    modalStayTrigger$: modalStayTrigger$,
    modalSwitchTrigger$: modalSwitchTrigger$,
  }
}

function model(actions, show$, state$) {
  
  const openModal$ = xs.merge(actions.modalTrigger$, show$)
    .map(_ => ({ el: '#modal-routingConfirmation', state: 'open' }))
  const closeModal$ = xs.merge(actions.modalStayTrigger$, actions.modalSwitchTrigger$)
    .map(_ => ({ el: '#modal-routingConfirmation', state: 'close' }))
  const switch$ = actions.modalSwitchTrigger$.mapTo(0)
  
  return {
    reducers$: xs.empty(),
    modal$: xs.merge(openModal$, closeModal$),
    switch$: switch$,
  }
}

function view(state$) {

    const modal$ = xs.of(div([
          // span(".routingConfirmation-show", "show routingConfirmation"),
          div("#modal-routingConfirmation.modal", [
            div(".modal-content", [
              div(".row .title", [
                p(".col .s12", "Interrupt workflow?"),
              ]),
              div(".row", [
                p(".col .s12", "Switching to a different page will interrupt the current process and all results so far will be lost.")
              ])
            ]),
            div(".modal-footer .row", [
                div(".col .s4 .offset-s1", [
                  span(".btn .waves-effect .waves-light .col .s12 .routingConfirmation-stay", "Wait"),
                ]),
                div(".col .s4 .offset-s1", [
                  span(".btn .waves-effect .waves-light .col .s12 .routingConfirmation-switch", "Interrupt and switch"),
                ]),
            ]),
          ]),
        ])
      )
    return modal$
}



function RoutingConfirmation(sources) {

  const logger = loggerFactory(
    "exporter",
    sources.onion.state$,
    "settings.common.debug"
  )

  const state$ = sources.onion.state$

  const actions = intent(sources.DOM)

  const model_ = model(actions, sources.show$, state$)

  const vdom$ = view(state$)


  return {
    log: xs.merge(logger(state$, "state$")),
    DOM: vdom$,
    onion: model_.reducers$,
    modal: model_.modal$,
    switch$: model_.switch$,
  }
}

export {RoutingConfirmation}
