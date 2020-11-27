/**
 * @license ExNet v0.0.2
 * (c) 2018-2020 X.Y.Z.
 * Released under the MIT License.
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let monitor;
function setMonitor(mon) {
    monitor = mon;
    console.log("production");
}
const a = 123;

const something = () => {
    console.log(123);
    console.log(123);
    console.log(123);
    console.log(123);
    console.log(123);
    console.log(a);
    console.log(monitor);
    return 0;
};
let env = 'prod';

setMonitor(void 0);

exports.env = env;
exports.something = something;
//# sourceMappingURL=exnet.prod.js.map
