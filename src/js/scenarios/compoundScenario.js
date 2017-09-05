export const scenario = [{ // Initiate ghost mode
        delay: 100,
        state: { form: { check: { ghostinput: true } } },
    },

    { //Form
        delay: 2000,
        state: { form: { check: { input: "1", showSuggestions: true, validated: false } } },
        message: {
            text: 'Please enter JNJ number or compound name',
            duration: 4000
        }
    },
    {
        delay: 1200,
        state: { form: { check: { input: "16", showSuggestions: true, validated: false } } },
    },
    {
        delay: 2100,
        state: { form: { check: { input: "169", showSuggestions: true, validated: false } } },
        message: {
            text: '<p>CNS Example: <em>sertraline</em> or <code>16944811</code> a known SSRI (depression)</p>',
            duration: 4000
        }
    },
    {
        delay: 1100,
        state: { form: { check: { input: "1694", showSuggestions: true, validated: false } } },
    },
    {
        delay: 800,
        state: { form: { check: { input: "16944", showSuggestions: true, validated: false } } },
    },
    {
        delay: 900,
        state: { form: { check: { input: "169448", showSuggestions: true, validated: false } } },
        message: {
            text: 'Select the desired compound from the drop down list of matches',
            duration: 4000
        }
    },
    {
        delay: 1500,
        state: { form: { check: { input: "16944811", showSuggestions: false, validated: true } } },
    },
    {
        delay: 10,
        state: { form: { check: { showSuggestions: false, validated: true } } },
        message: {
            text: 'When ready, press <i class="material-icons">play_arrow</i>',
            duration: 4000
        }
    },

    { // GO
        delay: 1000,
        state: { form: { check: { ghostoutput: true } } },
    },

    // Sample Selection
    {
        delay: 500,
        state: {},
        message: {
            text: 'All samples that correspond to the selected compound are tabulated',
            duration: 4000
        }
    },
    {
        delay: 3000,
        state: { form: { sampleSelection: { data: { index: 0, value: { use: false } } } } },
        message: {
            text: 'select or deselect the desired sample(s)',
            duration: 4000
        }
    },
    {
        delay: 1000,
        state: { form: { sampleSelection: { data: { index: 2, value: { use: false } } } } },
    },
    {
        delay: 1000,
        state: { form: { sampleSelection: { data: { index: 3, value: { use: false } } } } },
    },

    { // Signature creation
        delay: 100,
        state: { form: { sampleSelection: { ghostoutput: true, output: ['GJA129_P03'] } } },
        message: {
            text: 'Press Select',
            duration: 4000
        }
    },
    {
        delay: 6000,
        state: {},
        message: {
            text: 'A signed ranked gene signature is generated across the samples',
            duration: 6000
        }
    },
    {
        delay: 6000,
        state: {},
        message: {
            text: 'This gene signature can be copied and used in the target workflow',
            duration: 6000
        }
    },

    { // Filter
        delay: 7000,
        state: {
            filter: { ghostinput: { protocol: "MCF7" } },
            headTable: { input: { filter: { protocol: "MCF7" }, query: '-GOLT1B DDIT4 GPER -TNIP1 INSIG1 CLIC4 HMGCS1 HMOX1 AARS ELOVL6 -EGR1 -MAT2A FDFT1 -DDX42 PCK2 -MYCBP -RRP1B TSC22D3 CDK7 TIPARP -POLR1C -NFKBIA RGS2' } },
            tailTable: { input: { filter: { protocol: "MCF7" }, query: '-GOLT1B DDIT4 GPER -TNIP1 INSIG1 CLIC4 HMGCS1 HMOX1 AARS ELOVL6 -EGR1 -MAT2A FDFT1 -DDX42 PCK2 -MYCBP -RRP1B TSC22D3 CDK7 TIPARP -POLR1C -NFKBIA RGS2' } },
        },
        message: {
            text: 'Set filter to MCF7',
            duration: 7000
        }
    },

    { // Further info
        delay: 3000,
        state: {},
        message: {
            text: 'The corresponding similarity plots are vizualised for the entire compound data base',
            duration: 4000
        }
    },
    {
        delay: 3000,
        state: {},
        message: {
            text: 'Scroll down to assess the top 10 correlated and anticorrelated compounds',
            duration: 4000
        }
    },
    {
        delay: 3000,
        state: {},
        message: {
            text: 'Please note the fact that other anti-depressant compounds reveal high transcriptional correlation',
            duration: 4000
        }
    },

]