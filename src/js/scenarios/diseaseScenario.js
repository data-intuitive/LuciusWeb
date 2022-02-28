const filterValues = {
            dose: ["<= 4.0", "Other"],
            cell: ["kidney", "haematopoietic", "adipose", "endometrium", "blood", "skin", "bone", "central nervous system", "lung", "muscle", "large intestine", "other", "breast", "liver", "prostate", "ovary", "stomach", "N/A"],
            trtType: ["trt_cp", "trt_lig"]
        }

const filterCell = {
            dose: ['<= 4.0', 'Other'],
            cell: ['breast'],
            trtType: ['trt_cp', 'trt_lig']
        }

const filterCellDose = {
            dose: ['<= 4.0'],
            cell: ['breast'],
            trtType: ['trt_cp', 'trt_lig']
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
              filter_output: filterValues,
              state: {dose: false, cell: false, trtType: false},
            },
        },
        message: {
            text: 'When ready, press <i class="material-icons">play_arrow</i>',
            duration: 6000
        }
    },

    // Wait a bit for everything to load...

    { // open Filter #1
        delay: 12000,
        state: {
            filter: {
              state: {dose: true, cell: false, trtType: false}, // expand filters
            },
        },
        message: {
            text: 'Open filters',
            duration: 7000
        }
    },
    { // open Filter #2
        delay: 500,
        state: {
            filter: {
              state: {dose: true, cell: true, trtType: false}, // expand filters
            },
        },
    },
    { // open Filter #3
        delay: 500,
        state: {
            filter: {
              state: {dose: true, cell: true, trtType: true}, // expand filters
            },
        },
    },
    { // Select cell
        delay: 4000,
        state: {
            filter: {
              output: filterCell,
              state: {dose: true, cell: true, trtType: true}, // expand filters
            },
        },
        message: {
            text: 'Set filter to breast',
            duration: 7000
        }
    },
    { // select dose
        delay: 4000,
        state: {
            filter: {
              output: filterCellDose,
              state: {dose: true, cell: true, trtType: true}, // expand filters
            },
        },
        message: {
            text: 'Set filter to <= 4.0',
            duration: 7000
        }
    },
    { // close Filter #1
        delay: 4000,
        state: {
            filter: {
              state: {dose: false, cell: true, trtType: true}, // expand filters
            },
        },
        message: {
            text: 'Close filters to apply filter values',
            duration: 7000
        }
    },
    { // close Filter #2
        delay: 500,
        state: {
            filter: {
              state: {dose: false, cell: false, trtType: true}, // expand filters
            },
        },
    },
    { // close Filter #3
        delay: 500,
        state: {
            filter: {
              output: filterCellDose,
              filter_output: filterCellDose,
              state: {dose: false, cell: false, trtType: false}, // expand filters
            },
        },
    },
    { // output text
        delay: 6000,
        state: {},
        message: {
            text: 'The corresponding plots are vizualised for the entire compound database',
            duration: 4000
        }
    },
    { // output text
        delay: 3000,
        state: {},
        message: {
            text: 'Please scroll down to assess the top correlated and anti-correlated compounds',
            duration: 4000
        }
    }
]
