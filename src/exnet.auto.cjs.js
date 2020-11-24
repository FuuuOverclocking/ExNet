'use strict';

if (process.env.NODE_ENV === 'production') {
    module.exports = require('./exnet.prod.cjs.js');
} else {
    module.exports = require('./exnet.dev.cjs.js');
}
