import dropRepeats from 'xstream/extra/dropRepeats'

const log = (x) => console.log(x);

// Size stream, make it dependent on the size of container which is managed by CSS.
// TODO: Make it update immediately, currently only updates on new query
export function widthStream(domSource$, el) {
    return domSource$
                .select(el)
                .elements()
                .map(elements => elements[0])
                .map(container => {
                    if (container != undefined ) {
                        return container.offsetWidth
                    } else {
                        return 100
                    }
                    })
                .compose(dropRepeats())
                // .debug(log)
}