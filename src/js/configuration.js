export const initSettings = 
{
    version: 2.93,
	debug : true,
    filter: {
        debug: false
    },
	common: {
		version: "v2",
		blur: 0
	},
	headTable: {
        expandOptions: false,
        debug: false,
		count: 5,
		color: 'rgb(44,123,182)',
		title: 'Top Table',
		version: 'v2'
	},
	tailTable: {
        expandOptions: false,
        debug: false,
		count: 5,
		color: 'rgb(215,25,28)',
		title: 'Bottom Table',
		version: 'v2'
	},
	stats: {
		endpoint: 'classPath=com.dataintuitive.luciusapi.statistics',
		dummy: 1
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