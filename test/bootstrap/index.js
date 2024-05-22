import * as originalChai from "chai";
import * as http from "http";
import project from "../../index.js";

global.http = http;

global.should = originalChai.should();
global.expect = originalChai.expect;

global["chai"] = originalChai.use(project);
