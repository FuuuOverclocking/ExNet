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

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=exnet.dev.umd.js.map
