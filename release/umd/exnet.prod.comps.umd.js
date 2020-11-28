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

    const AttrA = {};
    const AttrB = {};

    var index = /*#__PURE__*/Object.freeze({
        __proto__: null,
        AttrA: AttrA,
        AttrB: AttrB
    });

    const ConnectorA = {};
    const ConnectorB = {};

    var index$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ConnectorA: ConnectorA,
        ConnectorB: ConnectorB
    });

    const NodeA = something();
    const NodeB = {};

    var index$2 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        NodeA: NodeA,
        NodeB: NodeB
    });

    setMonitor(void 0);

    exports.attrs = index;
    exports.connectors = index$1;
    exports.env = env;
    exports.nodes = index$2;
    exports.something = something;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=exnet.prod.comps.umd.js.map
