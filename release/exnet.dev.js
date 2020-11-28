/**
 * @license ExNet v0.0.3
 * (c) 2018-2020 X.Y.Z.
 * Released under the MIT License.
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let env = 'prod';
{
    env = 'dev';
}
const monitor = {
    aaa: 123,
    env,
};

let monitor$1;
function setMonitor(mon) {
    monitor$1 = mon;
    console.log("development");
}
const a = 123;

const something = () => {
    console.log(123);
    console.log(123);
    console.log(123);
    console.log(123);
    console.log(123);
    console.log(a);
    console.log(monitor$1);
    return 0;
};
exports.env = 'prod';
{
    exports.env = 'dev';
}

setMonitor(monitor);

exports.something = something;
//# sourceMappingURL=exnet.dev.js.map
