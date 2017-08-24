import { keys, values, filter, head, equals, map, prop, clone, omit, merge } from 'ramda'

const convertToSafeString = (s) => {
    const quotesRequired = (s.indexOf(';') > -1) || (s.indexOf(',') > -1)
    return (!quotesRequired) 
    ? s 
    : '"' + s + '"'
}

function convertToCSV(objArray) {
    const header = keys(objArray[0])
    const data = objArray.map(obj => values(obj))

    const arrArray = [header].concat(data)

    const csv = arrArray.map(arr => arr.map(el => convertToSafeString(el.toString())).join('\t')).join('\n')

    return csv;
}

export { convertToCSV }