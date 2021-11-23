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

export { convertToCSV }