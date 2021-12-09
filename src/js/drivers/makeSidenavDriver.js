import * as M from 'materialize-css'

function makeSidenavDriver() {

    var sidenav = undefined

    function sidenavDriver(in$) {

        // document.addEventListener('DOMContentLoaded', function() {
        //     var elems = document.querySelectorAll('.sidenav');
        //     var instances = M.Sidenav.init(elems);
        // });

        in$.addListener({
            next: (nav) => {
                if (nav.state == 'open') {
                    if (sidenav == undefined) {
                        var elems = document.querySelectorAll(nav.element)
                        sidenav = M.Sidenav.init(elems)
                    }
                    // Once initialized the code handles opening & closing itself when the user clicked the hamburger icon
                    // Calling open when the menu is already open is handled correctly so no hard calling it again
                    sidenav[0].open()
                }
                else if (nav.state == 'close') {
                    if (sidenav != undefined && sidenav.length > 0)
                        sidenav[0].close()
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