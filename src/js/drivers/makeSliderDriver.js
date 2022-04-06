import * as noUiSlider from 'materialize-css/extras/noUiSlider/nouislider'
import xs from 'xstream'


function makeSliderDriver() {

    function sliderDriver(in$) {

        const returnStream$ = xs.create()

        // TODO analyze code in noUiSlider so we can maybe get a stream-like event emitter instead of callbacks
        const sliderCallback = (id) => (value, handle) => {
            returnStream$.shamefullySendNext({id: id, value: value, handle: handle})
        }

        in$.addListener({
            next: (slider) => {
                var sliderElement = document.getElementById(slider.id)

                if (sliderElement.noUiSlider != undefined) {
                    sliderElement.noUiSlider.destroy()
                }                

                noUiSlider.create(sliderElement, slider.object)
                sliderElement.noUiSlider.on('update', sliderCallback(slider.id))
            },
            error: (e) => {
                console.error(e)
            }
        })
        return returnStream$
    }

    return sliderDriver
}

export { makeSliderDriver };