import * as M from 'materialize-css'

function makeModalDriver() {

    var elem = undefined
    var modal = undefined

    M.AutoInit()

    function modalDriver(in$) {

        in$.addListener({
            next: (modalInfo) => {
                const elem = document.querySelector(modalInfo.el)
                if (elem == undefined) {
                    console.error('Undefined element passed to ModalDriver')
                } else {
                    if (modalInfo.state != 'close') {
                        modal = M.Modal.init(elem)
                        modal.open()
                    } else {
                        modal = M.Modal.getInstance(elem)
                        modal.close()
                    }
                }
           },
           error: (m) => {
                console.error(m)
            }
        })

    }

    return modalDriver

}

export { makeModalDriver };