
export const scenario = config => [
    { //Form
        delay: 500,
        state: {},
        message: {
            text: 'Please enter the gene symbols, or ENSMBL or ENTREZ ID or Probe set ID, from your gene signature',
            duration: 8000
        }
    },
    { // Use typer to write full query string
        delay: 200,
        state: {
            routerInformation: {
                params: config.params,
            }
        }
    },
    {
        delay: 700,
        state: {},
        message: {
            text: 'Downregulated genes are marked with "-"',
            duration: 4000
        }
    },
    {
        delay: 4000,
        state: {},
        message: {
            text: 'The table provides feedback for the gene symbols in the signature',
            duration: 4000
        }
    },

    { // Validate
        delay: 2000,
        continue: (s) => (s.form.query1 == config.params.signature1),
        state: {},
        message: {
            text: 'When ready, press the update/validate button, removing faulty or non-measured L1000 genes',
            duration: 6000
        }
    },
    {
        delay: 1000,
        state: { form: { ghostUpdate1: true } }
    },
    {
        delay: 1000,
        continue: (s) => (s.form.query2 == config.params.signature2),
        state: { form: { ghostUpdate2: true } }
    },

    // Start analysis
    {
        delay: 4000,
        state: {
            form: { ghost: true },
        },
        message: {
            text: 'When ready, press <i class="material-icons">play_arrow</i>',
            duration: 6000
        }
    },

    // Wait a bit for everything to load...

    { // output text
        delay: 6000,
        state: {},
        message: {
            text: 'The correlation is vizualised for the entire database',
            duration: 4000
        }
    },

]
