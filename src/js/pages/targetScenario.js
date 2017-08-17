export const scenario = [
    { //Form
        delay: 500,
        state: { form: { check: { input: "A", showSuggestions: true, validated: false } } },
        message: {
            text: 'Start typing the symbol of a target',
            duration: 4000
        }
    },
    {
        delay: 100,
        state: { form: { check: { input: "AB", showSuggestions: true, validated: false } } },
    },
    {
        delay: 500,
        state: { form: { check: { input: "AB", showSuggestions: true, validated: false } } },
        message: {
            text: 'The dropdown suggests possible matches',
            duration: 4000
        }
    },
    {
        delay: 1000,
        state: { form: { check: { input: "ABL", showSuggestions: true, validated: false } } },
    },
    {
        delay: 500,
        state: { form: { check: { input: "ABL2", showSuggestions: true, validated: false } } },
    },
    {
        delay: 1000,
        state: { form: { check: { input: "ABL2", showSuggestions: false, validated: true } } },
        message: {
            text: 'When ready, press the play button',
            duration: 4000
        }
    },
    // Initiate Ghost
    {
        delay: 2000,
        state: { form: { check: { ghost: true } }, compoundTable: { input: { query: "ABL2" } } }
    },
    // Table
    {
        delay: 1000,
        state: {},
        message: {
            text: 'The table lists compounds with the given known target',
            duration: 4000
        }
    },
    {
        delay: 2000,
        state: { settings: { compoundTable: { expandOptions: true } } },
        message: {
            text: 'By clicking the table header, additional options are available',
            duration: 4000
        }
    },
    {
        delay: 5000,
        state: { settings: { compoundTable: { expandOptions: false } } },
        message: {
            text: 'Clicking the header again closes the option drawer',
            duration: 4000
        }
    },
    // Signature Form
    {
        delay: 2000,
        state: { sform: { query: "BRCA1 MELK -ABL2", validated: false } },
        message: {
            text: 'An additional signature can be specified',
            duration: 4000
        }
    },
    {
        delay: 3000,
        state: { sform: { query: "BRCA1 MELK", validated: false } },
        message: {
            text: 'The table shows targets that do not appear in L1000',
            duration: 4000
        }
    },
    {
        delay: 2000,
        state: { sform: { validated: true } },
        message: {
            text: 'An additional signature can be specified',
            duration: 4000
        }
    },
    // Histogram
    {
        delay: 2000,
        state: { hist: { input: { signature: 'BRCA1 MELK', target: 'ABL2' } } },
        message: {
            text: 'Pressing the GO button enables one to see the histogram',
            duration: 4000
        }
    }
]