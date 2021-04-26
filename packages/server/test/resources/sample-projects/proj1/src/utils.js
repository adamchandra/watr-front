"use strict";
/**
 * Various Utility functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.newIdGenerator = exports.getParameterByName = exports.corpusEntry = exports.getOrDie = exports.pp = void 0;
function pp(a) {
    return JSON.stringify(a, undefined, 2);
}
exports.pp = pp;
function getOrDie(v, msg = "null|undef") {
    if (v === null || v === undefined) {
        throw new Error(`Error: ${msg}`);
    }
    return v;
}
exports.getOrDie = getOrDie;
/**
 */
function corpusEntry() {
    const entry = location.href.split('/').reverse()[0].split('?')[0];
    return entry;
}
exports.corpusEntry = corpusEntry;
function getParameterByName(name, urlstr) {
    let url = urlstr;
    if (!url)
        url = window.location.href;
    const name0 = name.replace(/[[]]/g, "\\$&");
    const regex = new RegExp(`[?&]${name0}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
exports.getParameterByName = getParameterByName;
function newIdGenerator() {
    let currId = -1;
    const nextId = () => {
        currId += 1;
        return currId;
    };
    return nextId;
}
exports.newIdGenerator = newIdGenerator;
//# sourceMappingURL=utils.js.map