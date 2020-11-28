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

    setMonitor(monitor);

    exports.attrs = index;
    exports.connectors = index$1;
    exports.nodes = index$2;
    exports.something = something;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=exnet.dev.comps.umd.js.map
