/* !
 * chai-http - request helper
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/* !
 * net.isIP shim for browsers
 */
import isIP, { v4, v6 } from 'is-ip';
export { isIP, v4 as isIPv4, v6 as isIPv6 };
