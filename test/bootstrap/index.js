/*!
 * Attach ES6 Shim
 */
if (typeof Promise === 'undefined') {
  require('es6-shim');
}

/*!
 * Attach chai to global should
 */

global.chai = require('chai');
global.should = global.chai.should();

/*!
 * Chai Plugins
 */

//global.chai.use(require('chai-spies'));
//global.chai.use(require('chai-http'));

/*!
 * Import project
 */

global.chai.use(require('../..'));
