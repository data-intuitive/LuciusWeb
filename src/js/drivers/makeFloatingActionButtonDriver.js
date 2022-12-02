import * as M from 'materialize-css'

function makeFloatingActionButtonDriver() {

    var fab = undefined

    // options are:
    // Name	            Type	Default	Description
    // direction	    String	'top'	Direction FAB menu opens. Can be 'top', 'right', 'buttom', 'left'
    // hoverEnabled     Boolean	true	If true, FAB menu will open on hover instead of click
    // toolbarEnabled   Boolean	false	Enable transit the FAB into a toolbar on click

    function fabDriver(in$) {

        in$.addListener({
            next: (ev) => {
                // console.log("FAB" + ev.state)
                if (ev.state == 'init') {
                    if (fab == undefined) {

                        const elem = document.querySelector(ev.element)
                        if (elem == undefined)
                            console.warn("fabDriver couldn't find element")
                        else
                            fab = M.FloatingActionButton.init(elem, ev.options);
                    }
                    fab?.close()
                }
                else if (ev.state == 'update') {
                    const currentlyOpen = fab?.isOpen
                    const elem = document.querySelector(ev.element)
                    if (elem == undefined)
                        console.warn("fabDriver couldn't find element")
                    else {
                        fab?.destroy()
                        fab = M.FloatingActionButton.init(elem, ev.options);
                        if (currentlyOpen && fab != undefined)
                            fab.open()
                    }
                }
                else if (ev.state == 'open') {

                    if (fab == undefined) {

                        const elem = document.querySelector(ev.element)
                        fab = M.FloatingActionButton.init(elem, ev.options);


                        // We handle opening of the sidenav ourselves.
                        // Unless also implemented, this removes swipe-closing support though, which is one option to close the sidenav on mobile.
                        // Opening sidenav creates an overlay which gets an on-click listener, which is used to close the sidenav
                        // This is not removed by this call.
                        // sidenav._removeEventHandlers()
                    }

                    fab.open()
                }
                else if (ev.state == 'close') {
                    // can be used to e.g. add a button in the sidenav that closes the sidenav
                    if (fab != undefined)
                        fab.close()
                }
            },
            error: (e) => {
                console.error(e)
            }
        })

    }

    return fabDriver

}

export { makeFloatingActionButtonDriver };