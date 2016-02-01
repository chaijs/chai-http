/*!
 * chai-http - request helper
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * net.isIP shim for browsers
 */
var isIP = require('is-ip');

exports.isIP = isIP;
exports.isIPv4 = isIP.v4;
exports.isIPv6 = isIP.v6;
