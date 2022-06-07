import * as noUiSlider from 'materialize-css/extras/noUiSlider/nouislider'
import xs from 'xstream'


function makeSliderDriver() {

    function sliderDriver(in$) {

        const producer = {
            listener: 0,
            start: (listener) => { this.listener = listener },
            next: (obj) => { this.listener.next(obj) },
            stop: () => { },
          }
          
        const returnStream$ = xs.create(producer)

        const sliderCallback = (id) => (value, handle) => {
            producer.next( {id: id, value: value, handle: handle} )
        }

        in$.addListener({
            next: (slider) => {
                var sliderElement = document.getElementById(slider.id)

                if (sliderElement?.noUiSlider != undefined) {
                    sliderElement.noUiSlider.destroy()
                }                
                if (slider.shown) {
                    noUiSlider.create(sliderElement, slider.object)
                    sliderElement.noUiSlider.on('update', sliderCallback(slider.id))
                }
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