import { keys, values } from 'ramda'

const convertToSafeString = (s) => {
    const quotesRequired = (s.indexOf(';') > -1) || (s.indexOf(',') > -1)
    return (!quotesRequired)
        ? s
        : '"' + s + '"'
}

function convertToCSV(objArray) {

    // input is array of objects with 'key' and 'value' members
    // returning array of strings in format 'key:value'. Javascript handles serializing the arrays for us.
    const filterStringify = (filters) => 
        {
            return filters
                    .map((f) => {
                        return convertToSafeString(f.key) + ':' + convertToSafeString(f.value)
                        })
        }
    
    // only change filters if the member exists
    const data = objArray.map(
                    (d) => (d.filters !== undefined ? 
                                {...d, filters: filterStringify(d.filters)} : 
                                d
                            )
                        )

    return convertToCSV_internal(data)
}

function convertToCSV_internal(objArray) {
    const header = keys(objArray[0])
    const data = objArray.map(obj => values(obj))

    const arrArray = [header].concat(data)

    const csv = arrArray
        .map(arr =>
            arr
                .map(el => convertToSafeString(el.toString()))
                .join('\t')
        )
        .join('\n')

    return csv;
}

function convertTableToMd(objArray) {
    
    function convertToSafeString(s) {
        return s.replace('|', '\|')
    }

    function toTableLine(arr) {
        return '| ' + arr.join(' | ') + ' |'       
    }

    const header = ["Zhang Score", "Sample ID", "Cell", "Treatment ID", "Treatment Name", "Treatment Type"]
    const headerMd = toTableLine(header)
    const headerMdSubLine = toTableLine(header.map(s => '---'))

    const md = [headerMd, headerMdSubLine]
        .concat(
            objArray.map(row => (
                toTableLine(
                    [parseFloat(row.zhang).toFixed(3), row.id, row.cell, row.trt_id, row.trt_name, row.trt]
                    .map(s => convertToSafeString(s))
                )
            )
        ))
        .join('\n')

    return md
}

function convertFilterToMd(selectedFilters, availableFilters) {
    if (selectedFilters == undefined || selectedFilters?.length == 0) {
        return "No filters applied"
      }
    else {
        const allGroupNames = keys(availableFilters)
        const allFilters = allGroupNames.map((group) => {
        if (selectedFilters[group] != undefined)
        {
            return "\n### " + group + "\n\n" + selectedFilters[group].map((f) => "- " + f).join("\n")
        }
        else
        {
            return "\n### " + group + "\n\nNo filters selected"
        }
        
    })
    return allFilters.join("\n")
    }
}

export { convertToCSV, convertTableToMd, convertFilterToMd }
