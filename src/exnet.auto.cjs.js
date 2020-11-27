'use strict';

if (process.env.NODE_ENV === 'production') {
    module.exports = require('./exnet.prod.js');
} else {
    module.exports = require('./exnet.dev.js');
}
