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
    typer(
      config.treatment,
      { // Form input
          state: { form: { check: { input: config.treatment, showSuggestions: true, validated: false } } },
      }
    ),
    [
      { // Form input
        delay: 1500,
        state: { form: { check: { input: config.treatment, showSuggestions: false, validated: true } } },
      },

      { // GO
          delay: 1000,
          state: { form: { check: { ghostoutput: true } } },
      },

      { // Sample Selection
          delay: 500,
          state: {},
          message: {
              text: 'All samples that correspond to the selected compound are tabulated',
              duration: 4000
          }
      },
      {
          delay: 3000,
          state: { form: { sampleSelection: { data: { index: config.index, value: { use: true } } } } },
          message: {
              text: 'select or deselect the desired sample(s)',
              duration: 4000
          }
      },
      // {
      //     delay: 1000,
      //     state: { form: { sampleSelection: { data: { index: 2, value: { use: false } } } } },
      // },
      // {
      //     delay: 1000,
      //     state: { form: { sampleSelection: { data: { index: 3, value: { use: false } } } } },
      // },

      { // Signature creation
          delay: 500,
          state: { form: { sampleSelection: { ghostoutput: true, output: config.sample } } },
          message: {
              text: 'Press Select',
              duration: 4000
          }
      },
      {
          delay: 4000,
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
          delay: 7000,
          state: {
              filter: {
                input: config.signature,
                output: { trtType: [ "trt_cp" ] },
                filter_output: { trtType: [ "trt_cp" ] },
                ghost: { expand: false }
              },
              headTable: { input: { query: config.signature } },
              tailTable: { input: { query: config.signature } },
          },
          message: {
              text: 'Set filter a filter',
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
