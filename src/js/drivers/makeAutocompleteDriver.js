import * as M from 'materialize-css'
import xs from 'xstream';

/**
 * Factory for Autocomplete Driver.
 * 
 * Input: json object stream of the form:
 *   {
 *     el: the selector for the element to apply the autocomplete to
 *     data: A JSON object with the data
 *     render: A function taking the data object and rendering a string for the options
 *     strip: A function taking a string (from render) and strips it to the text we need in the input field 
 *   }
 * 
 * Output: stream of selected 'values' (from strip function).
 */
function makeAutocompleteDriver() {

    var ac = undefined

    function autocompleteDriver(in$) {

        const selection$ = xs.create({

            start: (listener) => {
                in$.addListener({
                    next: (acInfo) => {
                        const elem = document.querySelector(acInfo.el)
                        if (elem == undefined) {
                            console.error('Undefined element passed to AutocompleteDriver')
                        } else {
                            ac = M.Autocomplete.init(elem, {
                                data: acInfo.render(acInfo.data),
                                onAutocomplete: function (str) {
                                    listener.next(acInfo.strip(str))
                                    ac.close()
                                }
                            })
                            if (ac.isOpen) { ac.close() }
                            else { ac.open() }
                        }
                    },
                    error: (m) => {
                        console.error(m)
                    }
                })
            },
            stop: () => { }
        })

        return selection$

    }

    return autocompleteDriver

}

export { makeAutocompleteDriver };