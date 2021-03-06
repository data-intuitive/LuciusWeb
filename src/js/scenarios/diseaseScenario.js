const filterValues = {
            concentration: ['0.1', '1', '10', '30'],
            protocol: ['MCF7', 'PBMC'],
            type: ['test', 'poscon']
        }

const filterMCF7 = {
            concentration: ['0.1', '1', '10', '30'],
            protocol: ['MCF7'],
            type: ['test', 'poscon']
        }

const filterMCF7Conc = {
            concentration: [ '1' ],
            protocol: ['MCF7'],
            type: ['test', 'poscon']
        }

export const scenario = [
    { //Form
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
            filter: {
              input: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS',
              output: filterValues,
              ghost: { expand: false }
            },
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
            filter: {
              input: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS',
              output: filterMCF7,
              ghost: { expand: true, deselect: {protocol: 'MCF'} }
            },
            headTable: { input: { filter: filterMCF7, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
            tailTable: { input: { filter: filterMCF7, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
        },
        message: {
            text: 'Set filter to MCF7',
            duration: 7000
        }
    },
    {
        delay: 8000,
        state: {
            filter: {
              input: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS',
              output: filterMCF7Conc,
              ghost: { expand: true, deselect: {concentration: '0.1'} }
            },
            headTable: { input: { filter: filterMCF7Conc, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
            tailTable: { input: { filter: filterMCF7Conc, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
        },
        message: {
            text: 'Set filter to 1mM',
            duration: 7000
        }
    },
    {
        delay: 500,
        state: {
            filter: {
              input: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS',
              output: filterMCF7Conc,
              ghost: { expand: true, deselect: {concentration: '10'} }
            },
            headTable: { input: { filter: filterMCF7Conc, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
            tailTable: { input: { filter: filterMCF7Conc, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
        }
    },
    {
        delay: 500,
        state: {
            filter: {
              input: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS',
              output: filterMCF7Conc,
              ghost: { expand: true, deselect: {concentration: '30'} }
            },
            headTable: { input: { filter: filterMCF7Conc, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
            tailTable: { input: { filter: filterMCF7Conc, query: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS' } },
        }
    },
    {
        delay: 6000,
        state: {
            filter: {
              input: '-HEBP1 DDX10 -LAP3 -GLRX NP -SLC2A6 PMAIP1 DDIT4 -RAB31 FYN HSD17B10 KLHL21 MMP1 MAPKAPK5 EPRS',
              output: filterMCF7Conc,
              ghost: { expand: false }
            }
        },
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
