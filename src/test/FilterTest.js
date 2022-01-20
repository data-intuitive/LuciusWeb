import "mocha"
import * as assert from "assert"
import { model } from "../js/components/Filter.js"
import xs from "xstream"
import fromDiagram from "xstream/extra/fromDiagram"

describe("defaultReducer", function () {
  it("Generates a state if none exists", () => {
    const state = null
    const reducers$ = model(
      xs.empty(),
      xs.empty(),
      xs.empty(),
      xs.empty(),
      xs.empty(),
      xs.empty()
    )

    reducers$.addListener({
      next(f) {
        const newState = f(state)
        assert.deepStrictEqual(newState.core.output, {})
        assert.deepStrictEqual(newState.core.filter_output, {})
        assert.deepStrictEqual(newState.core.state, {dose: false, cell: false, trtType: false})
      },
      error(e) {
        done(e)
      },
      complete() {},
    })
  })
  it("Generates a clean state if one exists", () => {
    const state = {
      core: ["bla", "blah"],
      settings: { old: true },
    }
    const reducers$ = model(
      xs.empty(),
      xs.empty(),
      xs.empty(),
      xs.empty(),
      xs.empty(),
      xs.empty()
    )

    reducers$.addListener({
      next(f) {
        const newState = f(state)
        assert.deepStrictEqual(newState.core.output, {})
      },
      error(e) {
        done(e)
      },
      complete() {},
    })
  })
})

describe("possibleValuesReducer", function () {
  it("Updates the state with the possible values, leaves the rest intact", () => {
    const state = {
      core: { entry: "test", dirty: false },
      settings: {},
    }

    const possibleValues = [
      { filter1: [1, 2, 3] },
      { filter2: ["a", "b", "c"] },
    ]

    const possibleValues$ = xs.of(possibleValues)

    const reducers$ = model(
      possibleValues$,
      xs.empty(),
      xs.empty(),
      xs.empty(),
      xs.empty(),
      xs.empty()
    )

    reducers$
      .drop(1) // avoid the defaultReducer
      .addListener({
        next(f) {
          const newState = f(state)
          assert.deepStrictEqual(newState.core, state.core)
        },
        error(e) {
          done(e)
        },
        complete() {},
      })
  })
})

describe("inputReducer", function () {
  it("Updates the state when a new 'input' (signature) is provided", () => {
    const state = {
      core: { input: ["a", "b"] },
      settings: {},
    }

    const possibleValues = [
      { filter1: [1, 2, 3] },
      { filter2: ["a", "b", "c"] },
    ]

    const newInput = ["c", "d"]

    const input$ = xs.of(newInput)

    const reducers$ = model(
      xs.empty(),
      input$,
      xs.empty(),
      xs.empty(),
      xs.empty(),
      xs.empty()
    )

    reducers$
      .drop(1) // avoid the defaultReducer
      .addListener({
        next(f) {
          const newState = f(state)
          assert.deepStrictEqual(newState.core.input, newInput)
        },
        error(e) {
          done(e)
        },
        complete() {},
      })
  })
})

describe("toggleReducer with and without modifier", function () {
  it("Updates the state when a filter value is clicked", () => {
    const possibleValues = {
      dose: [1, 2, 3],
      cell: ["cell1", "cell2", "cell3"],
      trtType: ["a", "b", "c"],
    }
    const possibleValues$ = fromDiagram(`-x`).mapTo(possibleValues)

    const newInput = ["c", "d"]
    const input$ = fromDiagram("-x").mapTo(newInput)

    const switchDose1 = { dose: 1 }
    const switchCell = {cell: "cell1"}

    // Result of clicking on dose = 1
    const switchDose1$ = fromDiagram("--x").mapTo(switchDose1)
    // Result of clicking on cell = cell1
    const action2$ = fromDiagram("---x").mapTo(switchCell)
    // Result of clicking on dose = 1 again, this adds the filter value again
    const action3$ = fromDiagram("----x").mapTo(switchDose1)
    // Result of clicking on dose = 1 again, this time with modifier (see modifier$)
    const action4$ = fromDiagram("-------x").mapTo(switchDose1)
    const filterValuesAction$ = xs.merge(
      switchDose1$,
      action2$,
      action3$,
      action4$
    )

    const modifierFalse$ = fromDiagram("x------").mapTo(false)
    const modifierTrue$  = fromDiagram("------x").mapTo(true)
    const modifier$ = xs.merge(modifierFalse$, modifierTrue$)

    const reducers$ = model(
      possibleValues$,
      input$,
      filterValuesAction$,
      modifier$,
      xs.empty(),
      xs.empty()
    )

    // Predefine filters in settings as possible filters will be updated there
    const defaultFilter = {settings: {filter: {}}}
    const state$ = reducers$.fold((state, reducer) => reducer(state), defaultFilter)

    // The reducers should generate the following sequence for state.core.output
    // Values are duplicated as output & dirty reducers are changing
    let expectedOutput = [
      {},
      {},
      {},
      { dose: [2, 3] },
      { dose: [2, 3] },
      { dose: [2, 3], cell: ["cell2", "cell3"] },
      { dose: [2, 3], cell: ["cell2", "cell3"] },
      { dose: [1, 2, 3], cell: ["cell2", "cell3"] },
      { dose: [1, 2, 3], cell: ["cell2", "cell3"] },
      { dose: [], cell: ["cell2", "cell3"] },
      { dose: [], cell: ["cell2", "cell3"] },
    ]

    state$
      .drop(1) // drop the first state as it is undefined
      .addListener({
        next(state) {
          assert.deepStrictEqual(state?.core?.output, expectedOutput.shift())
        },
        error(e) {
          console.log(e)
        },
        complete() {
          console.log("done!")
        },
      })
  })
})

describe("uiReducer", function () {
  it("Becomes dirty when a filter value is clicked and becomes clean when the filter is clicked again", () => {
    const possibleValues = {
      dose: [1, 2, 3],
      cell: ["cell1", "cell2", "cell3"],
      trtType: ["a", "b", "c"],
    }
    const possibleValues$ = fromDiagram(`-x`).mapTo(possibleValues)

    const newInput = ["c", "d"]
    const input$ = fromDiagram("-x").mapTo(newInput)

    const switchDose1 = { dose: 1 }

    // Result of clicking on dose = 1
    const switchDose1$ = fromDiagram("---x").mapTo(switchDose1)
    // Result of clicking on dose = 1 again, this adds the filter value again
    const action1$ = fromDiagram("----x").mapTo(switchDose1)
    const action2$ = fromDiagram("-----x").mapTo(switchDose1)
    const filterValuesAction$ = xs.merge(
      switchDose1$,
      action1$,
      action2$
    )

    const modifierFalse$ = xs.of(false)

    const openFilter = {
      dose: true,
      cell: false,
      trtType: false,
    }
    const openFilter$ = fromDiagram("--x").mapTo(openFilter)

    const reducers$ = model(
      possibleValues$,
      input$,
      filterValuesAction$,
      modifierFalse$,
      openFilter$,
      xs.empty()
    )

    // Predefine filters in settings as possible filters will be updated there
    const defaultFilter = {settings: {filter: {}}}
    const state$ = reducers$.fold((state, reducer) => reducer(state), defaultFilter)

    // The reducers should generate the following sequence for state.core.dirty
    // Values are duplicated as output & dirty reducers are changing
    let expectedOutput = [
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      true,
      false,
      false,
      true,
      true,
    ]

    state$
      .drop(1) // drop the first state as it is undefined
      .addListener({
        next(state) {
          assert.deepStrictEqual(state?.core?.dirty, expectedOutput.shift())
        },
        error(e) {
          console.log(e)
        },
        complete() {
          console.log("done!")
        },
      })
  })
})
