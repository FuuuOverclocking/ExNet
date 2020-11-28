/**
 * @license ExNet v0.0.3
 * (c) 2018-2020 X.Y.Z.
 * Released under the MIT License.
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define('exnet', ['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.exnet = {}));
}(this, (function (exports) { 'use strict';

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

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=exnet.prod.umd.js.map
