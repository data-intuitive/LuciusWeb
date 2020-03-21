export const initSettings = {
    version: 3.104,
    deployment: {
      "name": "Amazon",
    },
    filter: {
        debug: false,
        values: {
            concentration: ['0.1', '1', '10', '30'],
            protocol: ['MCF7', 'PBMC'],
            type: ['test', 'poscon']
        }
    },
    common: {
        version: "v2",
        debug: false,
        blur: false,
        amountBlur: 5,
        ghostMode: false,
        modelTranslations: [
          {
            ui: 'GSKid',
            model: 'jnjs',
            comment: ''
          },
          {
            ui: 'Secondary ID',
            model: 'jnjb',
            comment: ''
          }
        ],
        jnj_modelTranslations: [
          {
            ui: 'jnjs',
            model: 'jnjs',
            comment: ''
          },
          {
            ui: 'jnjb',
            model: 'jnjb',
            comment: ''
          }
        ]
    },
    compoundTable: {
        type: 'compoundTable',
        apiClass: 'targetToCompounds',
        expandOptions: false,
        debug: false,
        count: 10,
        color: 'rgb(50,50,50)',
        bgcolor: 'rgba(50,50,50,0.08)',
        title: 'Compound Table',
        version: 'v2'
    },
    headTable: {
        type: 'topTable',
        apiClass: 'topTable',
        expandOptions: false,
        debug: false,
        count: 5,
        color: 'rgb(44,123,182)',
        bgcolor: 'rgba(44,123,182, 0.08)',
        title: 'Top Table',
        version: 'v2'
    },
    tailTable: {
        type: 'bottomTable',
        apiClass: 'topTable',
        expandOptions: false,
        debug: false,
        count: 5,
        color: 'rgb(215,25,28)',
        bgcolor: 'rgba(215,25,28, 0.08)',
        title: 'Bottom Table',
        version: 'v2'
    },
    hist: {
        debug: false,
        bins: 20
    },
    sim: {
        debug: false,
        binsX: 20,
        binsY: 20
    },
    plots: {
        debug: false,
        bins: 40,
        binsX: 20
    },
    form: {
        debug: false
    },
    geneAnnotations: {
        debug: false
    },
    compoundAnnotations: {
        debug: false,
        version: 'v1',
    }
};
