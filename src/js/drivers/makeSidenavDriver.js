import * as M from 'materialize-css'

function makeSidenavDriver() {

    // Start standard materialize code
    //  document.addEventListener('DOMContentLoaded', function() {
    //      var elems = document.querySelectorAll('.sidenav');
    //      console.log("elems:")
    //      console.log(elems)
    //      var instances = M.Sidenav.init(elems);
    //  });
    // Or with jQuery
    // $(document).ready(function(){
    //     $('.sidenav').sidenav();
    // });
    // End standard materialize code
    
    // var elem = undefined
    // var modal = undefined

    // M.AutoInit()

    function sidenavDriver(in$) {

        document.addEventListener('DOMContentLoaded', function() {
            var elems = document.querySelectorAll('.sidenav');
            console.log("elems:")
            console.log(elems)
            var instances = M.Sidenav.init(elems);
        });

        in$.addListener({
            next: (s) => {
                console.log("----next")
                console.log(s)
                //M.Sidenav.init(s)
            },
            error: (e) => {
                console.log("----error")
                console.error(e)
            }
        })

        // in$.addListener({
        //     next: (modalInfo) => {
        //         const elem = document.querySelector(modalInfo.el)
        //         if (elem == undefined) {
        //             console.error('Undefined element passed to ModalDriver')
        //         } else {
        //             if (modalInfo.state != 'close') {
        //                 modal = M.Modal.init(elem)
        //                 modal.open()
        //             } else {
        //                 modal = M.Modal.getInstance(elem)
        //                 modal.close()
        //             }
        //         }
        //    },
        //    error: (m) => {
        //         console.error(m)
        //     }
        // })

    }

    return sidenavDriver

}

export { makeSidenavDriver };