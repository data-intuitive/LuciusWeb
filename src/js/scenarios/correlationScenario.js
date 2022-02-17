
const typerString1 = "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS"
const typerString2 = "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS"

export const scenario = [
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
                params: {
                    signature1: typerString1,
                    signature2: typerString2,
                    typer: "50"
                },
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
        continue: (s) => (s.form.query1 == typerString1),
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
        continue: (s) => (s.form.query2 == typerString2),
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
