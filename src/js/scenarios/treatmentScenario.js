import {mergeDeepRight, concat} from 'ramda'

/**
 * A small utility function to simulate a user typing in the interface
 */
const typer = (text, json) => {
  const l = text.length
  const range = Array(l).fill().map((_, index) => index + 1)
  const texts = range.map(i => text.substr(0,i))

  return texts.map(substring =>
    mergeDeepRight(
      mergeDeepRight(
        json,
        { delay: Math.floor(Math.random()*500) }
      ),
      {state: {form: {check: {input: substring}}}}
    )
  )
}

function notEmpty(data) {
  return data != undefined && data != ""
}

/**
 * Definition of the scenario
 * Configuration is provided by means of `config` object:
 * {
 *   treatment: <>
 *   index: <>
 *   sample: <>
 *   signature: <>
 * }
 */
export const scenario = config =>
  Array.prototype.concat(
    [
      { // Initiate ghost mode
          delay: 100,
          state: { form: { check: { ghostinput: true } } },
      },
    ],
    [
      {
        delay: 500,
        state: {
          routerInformation: {
            params: config.params,
          }
        }
      }
    ],
    [
      { // Sample Selection
        delay: 100,
        state: {},
        message: {
            text: 'Enter a treatment for which to search',
            duration: 4000
        }
      },

      { // GO
        delay: 1000,
        continue: (s) => (s.form.check.validated),
        state: { form: { check: { ghostoutput: true } } },
        // message: {
        //   text: 'Press the \'GO\' button',
        //   duration: 4000
        // }
      },

      { // Sample Selection
          delay: 500,
          continue: (s) => (notEmpty(s.form.sampleSelection.output)),
          state: {},
          message: {
              text: 'All samples that correspond to the selected compound are tabulated',
              duration: 4000
          }
      },
      {
          delay: 3000,
          state: {},
          message: {
              text: 'select or deselect the desired sample(s)',
              duration: 4000
          }
      },

      { // Signature creation
          delay: 500,
          state: { form: { sampleSelection: { ghostoutput: true } } },
          message: {
              text: 'Press Select',
              duration: 4000
          }
      },
      {
          delay: 100,
          continue: (s) => (notEmpty(s.form.signature.output)),
          state: {},
          message: {
              text: 'A signed ranked gene signature is generated across the samples',
              duration: 6000
          }
      },
      {
          delay: 4000,
          state: {},
          message: {
              text: 'This gene signature can be copied and used in the target workflow',
              duration: 6000
          }
      },

      { // Filter
          delay: 500,
          continue: (s) => (notEmpty(s.form.signature.output)),
          state: {},
          message: {
              text: 'Set a filter',
              duration: 7000
          }
      },

      // { // Further info
      //     delay: 3000,
      //     state: {},
      //     message: {
      //         text: 'The corresponding plots are generated for the entire compound database',
      //         duration: 4000
      //     }
      // },
      // {
      //     delay: 3000,
      //     state: {},
      //     message: {
      //         text: 'Scroll down to assess the top correlated and anti-correlated compounds',
      //         duration: 4000
      //     }
      // },
      // {
      //     delay: 3000,
      //     state: {},
      //     message: {
      //         text: 'Please note the fact that other anti-depressant compounds reveal high transcriptional correlation',
      //         duration: 4000
      //     }
      // },

  ]
)
