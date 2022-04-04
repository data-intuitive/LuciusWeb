import * as noUiSlider from 'materialize-css/extras/noUiSlider/nouislider'


function makeSliderDriver() {

    function sliderDriver(in$) {

        in$.addListener({
            next: (slider) => {
                var sliderElement = document.getElementById(slider.id)
                noUiSlider.create(sliderElement, slider.object)
            },
            error: (e) => {
                console.error(e)
            }
        })

    }

    return sliderDriver
}

export { makeSliderDriver };