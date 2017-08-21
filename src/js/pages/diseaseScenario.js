export const scenario = [
    { //Form
        delay: 500,
        state: { form: { query: "BR", validated: false } },
        message: {
            text: 'Type the signature, using - sign for down-regulation',
            duration: 6000
        }
    },
    {
        delay: 100,
        state: { form: { query: "BRC", validated: false } },
    },
    {
        delay: 200,
        state: { form: { query: "BRCA", validated: false } },
    },
    {
        delay: 300,
        state: { form: { query: "BRCA1", validated: false } },
        message: {
            text: 'The table provides feedback on the targets in the signature',
            duration: 4000
        }
    },
    {
        delay: 1000,
        state: { form: { query: "BRCA1 HELP -MELK", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "BRCA1 -MELK", validated: true } },
    },
    {
        delay: 1000,
        state: { form: { validated: true } },
        message: {
            text: 'Faulty targets can be removed by clicking the button below the table',
            duration: 4000
        }
    },
    // Initiate Ghost, prepare tables to fit on the screen
    {
        delay: 4000,
        state: { 
            form: { ghost: true }, 
            headTable: { input: { query : 'BRCA1 -MELK'}}, 
            tailTable: { input: { query : 'BRCA1 -MELK'}},
            settings: {
                headTable: { count: 2},
                tailTable: { count: 2}
            }
        },
        message: {
            text: 'When ready, press the play button',
            duration: 4000
        }
    }
]