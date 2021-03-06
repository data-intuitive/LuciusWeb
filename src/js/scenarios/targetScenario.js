export const scenario = [
    { // Initiate ghost input mode
        delay: 10,
        state: { form: { check: { ghostinput: true } } },
    },
    { //Form
        delay: 500,
        state: { form: { check: { input: "C", showSuggestions: true, validated: false } } },
        message: {
            text: 'Please enter the target of choice',
            duration: 4000
        }
    },
    {
        delay: 1300,
        state: { form: { check: { input: "CD", showSuggestions: true, validated: false } } },
    },
    {
        delay: 2100,
        state: { form: { check: { input: "CDK", showSuggestions: true, validated: false } } },
        message: {
            text: 'Select the desired target from the drop-down list of matches',
            duration: 4000
        }
    },
    {
        delay: 3000,
        state: { form: { check: { input: "CDK7", showSuggestions: false, validated: true } } },
        message: {
            text: 'ONCO Example: CDK7',
            duration: 4000
        }
    },
    {
        delay: 20,
        state: { form: { check: { showSuggestions: false, validated: true } } },
    },
    {
        delay: 1000,
        state: {},
        message: {
            text: 'When ready, press <i class="material-icons">play_arrow</i>',
            duration: 4000
        }
    },

    // RUN ...
    {
        delay: 2000,
        state: { form: { check: { ghostoutput: true } }, compoundTable: { input: { query: "CDK7" } } }
    },

    // INFO
    {
        delay: 6000,
        state: {},
        message: {
            text: 'Please scroll down to assess the list of L1000 profiled compounds that are known to target CDK7',
            duration: 4000
        }
    },

    // Signature Form
    {
        delay: 6000,
        state: { sform: { query: "-ENSG00000086827", validated: false } },
        message: {
            text: 'Please enter the gene symbols, or ENSMBL or ENTREZ ID or Probe set ID, from your gene signature',
            duration: 4000
        }
    },
    {
        delay: 1000,
        state: { sform: { query: "-ENSG00000086827 -CDC20", validated: false } },
        message: {
            text: 'Downregulated genes are marked with "-"',
            duration: 4000
        }
    },
    {
        delay: 1000,
        state: { sform: { query: "-ENSG00000086827 -CDC20 -KIF20A", validated: false } },
        message: {
            text: '',
            duration: 4000
        }
    },
    {
        delay: 1000,
        state: { sform: { query: "-ENSG00000086827 -CDC20 -KIF20A EML3", validated: false } },
        message: {
            text: 'The table provides feedback from the gene symbols in the signature',
            duration: 4000
        }
    },
    {
        delay: 1000,
        state: { sform: { query: "-ENSG00000086827 -CDC20 -KIF20A EML3 -FAIM -PSMG1", validated: false } },
    },
    { // Validate
        delay: 2000,
        state: { sform: { query: '-ZW10 -CDC20 -KIF20A EML3 -FAIM -PSMG1', validated: true } },
        message: {
            text: 'When ready, press the update/validate button, removing faulty or non-measured L1000 genes',
            duration: 6000
        }
    },
    {
        delay: 100,
        state: { sform: { validated: true } },
    },

    // Histogram
    {
        delay: 2000,
        state: { sform: { ghost: true }, hist: { input: { signature: 'BRCA1 MELK', target: 'ABL2' } } },
        message: {
            text: 'When ready, press <i class="material-icons">play_arrow</i>',
            duration: 4000
        }
    },

    { // Filter
        delay: 8000,
        state: {
            filter: {
              input: '-ZW10 -CDC20 -KIF20A EML3 -FAIM -PSMG1',
              ghost: { expand: false }
            },
            headTable: { input: { query: '-ZW10 -CDC20 -KIF20A EML3 -FAIM -PSMG1' } },
            tailTable: { input: { query: '-ZW10 -CDC20 -KIF20A EML3 -FAIM -PSMG1' } },
        },
        message: {
            text: 'The table of compounds is generated with the specific know target',
            duration: 4000
        }
    },
    {
        delay: 4000,
        state: {},
        message: {
            text: 'The CDK7 L1000 profiled compounds are now superimposed on the gene signature cpd based distribution',
            duration: 4000
        }
    },
]
