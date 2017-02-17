
export const vegaHistogramSpec = (data, width, height) => {
	const obj = {
		// "width": width,
		// "height": height,
		"padding": {"top": 10, "left": 30, "bottom": 30, "right": 10},

		"signals": [
			{
			"name": "tooltip",
			"init": {},
			"streams": [
				{"type": "rect:mouseover", "expr": "datum"},
				{"type": "rect:mouseout", "expr": "{}"}
			]
			}
		],

		"data": [
			{
			"name": "table",
			"values": data,
			"format": {
				type: "json",
				parse: {
					count: "number",
					zhangAvg: "number"
				}
			}
			}
		],

		"scales": [
			{
			"name": "x",
			"type": "ordinal",
			"range": "width",
			"domain": {"data": "table", "field": "bin"}
			},
			{
			"name": "y",
			"type": "linear",
			"range": "height",
			"domain": {"data": "table", "field": "count"},
			"nice": true
			},
			{
			"name": "c",
			"type": "linear",
			"range": ["red", "green"],
			"domain": {"data": "table", "field": "zhangAvg"}
			},
      { 
        "name": "xscale", 
        "type": "ordinal", 
        "range": "width",
        "domain": {"data": "table", "field": "upperBound"}, 
        nice: true 
      }
		],
		"axes": [
		    {
          "type": "x", 
          "scale": "xscale",
          "properties": {
          "ticks": {
            "stroke": {"value": "steelblue"},
          },
          "majorTicks": {
            "strokeWidth": {"value": 2},
            "stroke": {value: "lightgray"} 
          },
          "labels": {
            "text": {"template": "{{datum.data|number:','}}"},
            "fill": {"value": "lightgray"},
            "angle": {"value": 50},
            "fontSize": {"value": 12},
            "align": {"value": "left"},
            "baseline": {"value": "middle"},
            "dx": {"value": 3}
          },
          "title": {
            "fontSize": {"value": 16}
          },
          "axis": {
            "stroke": {"value": "#333"},
            "strokeWidth": {"value": 0}
          }
        }
    },
  		],

		"marks": [
			{
			"type": "rect",
			"from": {"data": "table"},
			"properties": {
				"enter": {
				"x": {"scale": "x", "field": "bin"},
				"width": {"scale": "x", "band": true, "offset": -4},
				"y": {"scale": "y", "field": "count"},
				"y2": {"scale": "y", "value": 0},
        "fill": {"scale": "c", "field": "zhangAvg"},
				// "fill": {"scale": "c", "field": "zhangAvg"},
				"fillOpacity": {"value": 0.5},
        "stroke" : {value: "lightgray"},
        "strokeWidth": {"value": 1.5},
        "strokeOpacity": {"value": 50}
				},
				"update": {
          "stroke": [
            { "test": "datum._id == tooltip._id",
            "value": "gray"
            },
            {"value": "lightgray"}
          ]
				}
			}
			},
			{
			"type": "text",
			"properties": {
				"enter": {
				"align": {"value": "center"},
				"fill": {"value": "#333"}
				},
				"update": {
				"x": {"scale": "x", "signal": "tooltip.bin"},
				"dx": {"scale": "x", "band": true, "mult": 0.5},
				"y": {"scale": "y", "signal": "tooltip.count", "offset": -5},
				"text": {"signal": "tooltip.count"},
				"fillOpacity": [
					{ "test": "!tooltip._id",
					"value": 0
					},
					{"value": 0.5}
				]
				}
			}
			}
		]
	}
	return obj;
};

export const emptyData = [{}];

export const exampleData = [
      {
        "indexLow": "0",
        "count": "105",
        "lowerBound": "0.9000",
        "indexHigh": "104",
        "upperBound": "1.0000",
        "zhangHigh": "0.9994001874414246",
        "zhangAvg": "0.9891759457037808",
        "bin": "0",
        "zhangLow": "0.9362983682983683"
      },
      {
        "indexLow": "105",
        "count": "2",
        "lowerBound": "0.8000",
        "indexHigh": "106",
        "upperBound": "0.9000",
        "zhangHigh": "0.8937062937062937",
        "zhangAvg": "0.8544149184149183",
        "bin": "1",
        "zhangLow": "0.8151235431235431"
      },
      {
        "indexLow": "107",
        "count": "1",
        "lowerBound": "0.7000",
        "indexHigh": "107",
        "upperBound": "0.8000",
        "zhangHigh": "0.7264708624708625",
        "zhangAvg": "0.7264708624708625",
        "bin": "2",
        "zhangLow": "0.7264708624708625"
      },
      {
        "indexLow": "108",
        "count": "7",
        "lowerBound": "0.6000",
        "indexHigh": "114",
        "upperBound": "0.7000",
        "zhangHigh": "0.6842144522144522",
        "zhangAvg": "0.6478934398934398",
        "bin": "3",
        "zhangLow": "0.611990675990676"
      },
      {
        "indexLow": "115",
        "count": "33",
        "lowerBound": "0.5000",
        "indexHigh": "147",
        "upperBound": "0.6000",
        "zhangHigh": "0.5981165501165501",
        "zhangAvg": "0.5413112947658403",
        "bin": "4",
        "zhangLow": "0.5021911421911421"
      },
      {
        "indexLow": "148",
        "count": "46",
        "lowerBound": "0.4000",
        "indexHigh": "193",
        "upperBound": "0.5000",
        "zhangHigh": "0.499990675990676",
        "zhangAvg": "0.44671337865779825",
        "bin": "5",
        "zhangLow": "0.40503496503496506"
      },
      {
        "indexLow": "194",
        "count": "80",
        "lowerBound": "0.3000",
        "indexHigh": "273",
        "upperBound": "0.4000",
        "zhangHigh": "0.39615850815850817",
        "zhangAvg": "0.3450356835604257",
        "bin": "6",
        "zhangLow": "0.30004662004662"
      },
      {
        "indexLow": "274",
        "count": "140",
        "lowerBound": "0.2000",
        "indexHigh": "413",
        "upperBound": "0.3000",
        "zhangHigh": "0.2997855477855478",
        "zhangAvg": "0.24719331870878272",
        "bin": "7",
        "zhangLow": "0.2016223776223776"
      },
      {
        "indexLow": "414",
        "count": "169",
        "lowerBound": "0.1000",
        "indexHigh": "582",
        "upperBound": "0.2000",
        "zhangHigh": "0.19707226107226108",
        "zhangAvg": "0.14842297432939777",
        "bin": "8",
        "zhangLow": "0.1012027972027972"
      },
      {
        "indexLow": "583",
        "count": "168",
        "lowerBound": "0.0000",
        "indexHigh": "750",
        "upperBound": "0.1000",
        "zhangHigh": "0.09954312354312354",
        "zhangAvg": "0.05067701656876912",
        "bin": "9",
        "zhangLow": "0.000055944055944055945"
      },
      {
        "indexLow": "751",
        "count": "142",
        "lowerBound": "-0.1000",
        "indexHigh": "892",
        "upperBound": "0.0000",
        "zhangHigh": "-0.00016783216783216784",
        "zhangAvg": "-0.051999474026771846",
        "bin": "10",
        "zhangLow": "-0.09972960372960372"
      },
      {
        "indexLow": "893",
        "count": "132",
        "lowerBound": "-0.2000",
        "indexHigh": "1024",
        "upperBound": "-0.1000",
        "zhangHigh": "-0.10071794871794872",
        "zhangAvg": "-0.1451634883912297",
        "bin": "11",
        "zhangLow": "-0.19934731934731934"
      },
      {
        "indexLow": "1025",
        "count": "106",
        "lowerBound": "-0.3000",
        "indexHigh": "1130",
        "upperBound": "-0.2000",
        "zhangHigh": "-0.20147319347319348",
        "zhangAvg": "-0.2474590378823017",
        "bin": "12",
        "zhangLow": "-0.29683916083916084"
      },
      {
        "indexLow": "1131",
        "count": "70",
        "lowerBound": "-0.4000",
        "indexHigh": "1200",
        "upperBound": "-0.3000",
        "zhangHigh": "-0.3024895104895105",
        "zhangAvg": "-0.35290103848041987",
        "bin": "13",
        "zhangLow": "-0.39955244755244756"
      },
      {
        "indexLow": "1201",
        "count": "65",
        "lowerBound": "-0.5000",
        "indexHigh": "1265",
        "upperBound": "-0.4000",
        "zhangHigh": "-0.40074592074592075",
        "zhangAvg": "-0.4441012686494051",
        "bin": "14",
        "zhangLow": "-0.49652214452214455"
      },
      {
        "indexLow": "1266",
        "count": "42",
        "lowerBound": "-0.6000",
        "indexHigh": "1307",
        "upperBound": "-0.5000",
        "zhangHigh": "-0.5016503496503496",
        "zhangAvg": "-0.5370971319631115",
        "bin": "15",
        "zhangLow": "-0.5999254079254079"
      },
      {
        "indexLow": "1308",
        "count": "21",
        "lowerBound": "-0.7000",
        "indexHigh": "1328",
        "upperBound": "-0.6000",
        "zhangHigh": "-0.6006526806526806",
        "zhangAvg": "-0.6475420982225107",
        "bin": "16",
        "zhangLow": "-0.6886153846153846"
      },
      {
        "indexLow": "1329",
        "count": "15",
        "lowerBound": "-0.8000",
        "indexHigh": "1343",
        "upperBound": "-0.7000",
        "zhangHigh": "-0.7024522144522145",
        "zhangAvg": "-0.7371064298816877",
        "bin": "17",
        "zhangLow": "-0.7951515151515152"
      },
      {
        "bin": "18",
        "lowerBound": "-0.9000",
        "upperBound": "-0.8000",
        "count": "0"
      },
      {
        "bin": "19",
        "lowerBound": "-1.0000",
        "upperBound": "-0.9000",
        "count": "0"
      }
    ];
