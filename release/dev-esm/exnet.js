/**
 * @license ExNet v0.0.4
 * (c) 2018-2020 X.Y.Z.
 * Released under the MIT License.
 */

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
let env$1 = 'prod';
{
    env$1 = 'dev';
}

setMonitor(monitor);

export { env$1 as env, something };
//# sourceMappingURL=exnet.js.map
