import * as M from 'materialize-css'

function makeSidenavDriver() {

    var sidenav = undefined

    function sidenavDriver(in$) {

        in$.addListener({
            next: (nav) => {
                if (nav.state == 'open') {

                    if (sidenav == undefined) {
                        const elem = document.querySelector(nav.element)
                        sidenav = M.Sidenav.init(elem)
                        // We handle opening of the sidenav ourselves.
                        // Unless also implemented, this removes swipe-closing support though, which is one option to close the sidenav on mobile.
                        // Opening sidenav creates an overlay which gets an on-click listener, which is used to close the sidenav
                        // This is not removed by this call.
                        sidenav._removeEventHandlers()
                    }

                    sidenav.open()
                }
                else if (nav.state == 'close') {
                    // can be used to e.g. add a button in the sidenav that closes the sidenav
                    if (sidenav != undefined)
                        sidenav.close()
                }
            },
            error: (e) => {
                console.error(e)
            }
        })

    }

    return sidenavDriver

}

export { makeSidenavDriver };