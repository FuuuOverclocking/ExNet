/**
 * @license ExNet v0.0.3
 * (c) 2018-2020 X.Y.Z.
 * Released under the MIT License.
 */

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

export { env, something };
//# sourceMappingURL=exnet.js.map
