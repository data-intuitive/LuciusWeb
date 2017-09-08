export const scenario = [{ //Form
        delay: 500,
        state: { form: { query: "-E", validated: false } },
        message: {
            text: 'Please enter the gene symbols, or ENSMBL or ENTREZ ID or Probe set ID, from your gene signature',
            duration: 8000
        }
    },
    {
        delay: 200,
        state: { form: { query: "-EN", validated: false } },
    },
    {
        delay: 100,
        state: { form: { query: "-ENS", validated: false } },
    },
    {
        delay: 600,
        state: { form: { query: "-ENSG00000013583", validated: false } },
        message: {
            text: 'Downregulated genes are marked with "-"',
            duration: 4000
        }
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860", validated: false } },
        message: {
            text: 'The table provides feedback for the gene symbols in the signature',
            duration: 4000
        }
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1 DDIT4", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1 DDIT4 -RAB31", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5", validated: false } },
    },
    {
        delay: 1000,
        state: { form: { query: "-ENSG00000013583 DDX10 -217933_s_at -GLRX 4860 -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS", validated: false } },
    },

    { // Validate
        delay: 2000,
        state: { form: { query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS', validated: true } },
        message: {
            text: 'When ready, press the update/validate button, removing faulty or non-measured L1000 genes',
            duration: 6000
        }
    },
    {
        delay: 100,
        state: { form: { validated: true } },
    },

    // Initiate Ghost, prepare tables to fit on the screen
    {
        delay: 4000,
        state: {
            form: { ghost: true },
            headTable: { input: { query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
            tailTable: { input: { query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
        },
        message: {
            text: 'When ready, press <i class="material-icons">play_arrow</i>',
            duration: 6000
        }
    },

    // Wait a bit for everything to load...

    { // Filter
        delay: 12000,
        state: {
            filter: { ghostinput: { protocol: "PBMC" } },
            headTable: { input: { filter: { protocol: "PBMC" }, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
            tailTable: { input: { filter: { protocol: "PBMC" }, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
        },
        message: {
            text: 'Set filter to PBMC',
            duration: 7000
        }
    },
    {
        delay: 8000,
        state: {
            filter: { ghostinput: { concentration: "1", protocol: 'PBMC' } },
            headTable: { input: { filter: { concentration: "1", protocol: "PBMC" }, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
            tailTable: { input: { filter: { concentration: "1", protocol: "PBMC" }, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
        },
        message: {
            text: 'Set filter to 1mM',
            duration: 7000
        }
    },
    {
        delay: 6000,
        state: {},
        message: {
            text: 'The corresponding plots are vizualised for the entire compound database',
            duration: 4000
        }
    },
    {
        delay: 3000,
        state: {},
        message: {
            text: 'Please scroll down to assess the top correlated and anti-correlated compounds',
            duration: 4000
        }
    }
]

export const oldScenario = [{ //Form
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
            headTable: { input: { query: 'BRCA1 -MELK' } },
            tailTable: { input: { query: 'BRCA1 -MELK' } },
            settings: {
                headTable: { count: 2 },
                tailTable: { count: 2 }
            }
        },
        message: {
            text: 'When ready, press the play button',
            duration: 4000
        }
    }
]