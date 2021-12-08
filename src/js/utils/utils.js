import dropRepeats from 'xstream/extra/dropRepeats'
import { prop } from 'ramda'

// Size stream, make it dependent on the size of container which is managed by CSS.
// TODO: Make it update immediately, currently only updates on new query
export function widthStream(domSource$, el) {
    return domSource$
        .select(el)
        .elements()
        .map(elements => elements[0])
        .map(container => {
            if (container != undefined) {
                return container.offsetWidth
            } else {
                return 100
            }
        })
        .compose(dropRepeats())
        .remember()
        // .debug(log)
}

export const titleCase = (phrase) =>
    (phrase != null)
      ? phrase.toLowerCase().replace(/^\w|\s\w|\(\w|-\w\/\w/g, function(w) {return w.toUpperCase()})
      : ""

/**
 * Take the absolute value of a gene in a very basic way.
 */
export const absGene = (signedGene) => signedGene?.replace('-', '').trim()

/**
 * For later use: Array extensions
 */
Array.prototype.sum = Array.prototype.sum || function() {
    return this.reduce(function(sum, a) { return sum + Number(a) }, 0);
}

Array.prototype.average = Array.prototype.average || function() {
    return this.sum() / (this.length || 1);
}

Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};
