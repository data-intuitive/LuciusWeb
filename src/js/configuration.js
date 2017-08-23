export const initSettings = 
{
    version: 2.999,
    filter: {
        debug: false
    },
	common: {
		version: "v2",
        debug: false,
		blur: 0,
        ghostMode: true
	},
	compoundTable: {
        type: 'compoundTable',
        apiClass: 'targetToCompounds',
        expandOptions: false,
        debug: false,
		count: 50,
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
	stats: {
		endpoint: 'classPath=com.dataintuitive.luciusapi.statistics',
		dummy: 1
	},
	hist: {
        debug: true,
		bins: 20
	},
	sim: {
        debug: false,
		binsX: 20,
		binsY: 20
	},
	form: {
		debug: false
	},
	api: {
		hostname: 'localhost',
		port: 8080,
		context: 'luciusapi',
		appName: 'luciusapi',
		url: 'http://localhost:8090/jobs?context=luciusapi&appName=luciusapi&appName=luciusapi&sync=true',
	},
	sourire: {
		hostname: 'localhost',
		port: 9000,
		url: 'http://localhost:9999/molecule/'
	}
};