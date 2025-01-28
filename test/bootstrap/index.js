import * as originalChai from 'chai';
import * as http from 'http';
// this import is available from defining `imports` in package.json
import {default as project} from 'chai-http';

global.http = http;

global.should = originalChai.should();
global.expect = originalChai.expect;

global['chai'] = originalChai.use(project);
