import * as chai from 'chai';
import project from '../../index.js';

global.chai = chai;
global.should = global.chai.should();
global.expect = global.chai.expect;

global.chai.use(project);
