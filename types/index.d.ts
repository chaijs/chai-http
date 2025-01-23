// Definitions by: Wim Looman <https://github.com/Nemo157>
//                 Liam Jones <https://github.com/G1itcher>
//                 Federico Caselli <https://github.com/CaselIT>
//                 Bas Luksenburg <https://github.com/bas-l>
//                 Austin Cawley-Edwards <https://github.com/austince>
// TypeScript Version: 3.0
/// <reference types="chai" />
import * as superAgentRequest from 'superagent';

// Merge namespace with global chai
declare global {
  namespace Chai {
    interface ChaiStatic {
      request: ChaiHttpRequest;
    }

    interface ChaiHttpRequest {
      agent(server: any): ChaiHttp.Agent;
      Request(app: string | any, method: string, path: string): void;
      execute: (app: string | any) => ChaiHttp.Agent;
    }

    interface Assertion {
      redirectTo(location: string | RegExp): Assertion;

      param(key: string, value?: string): Assertion;

      cookie(key: string, value?: string): Assertion;

      status(code: number): Assertion;

      statusCode(code: number): Assertion;

      header(key: string, value?: string | RegExp): Assertion;

      charset(charset: string): Assertion;

      headers: Assertion;
      json: Assertion;
      text: Assertion;
      html: Assertion;
      redirect: Assertion;
    }

    interface TypeComparison {
      ip: Assertion;
    }
  }

  namespace ChaiHttp {
    interface Response extends superAgentRequest.Response {}
    interface Agent extends superAgentRequest.SuperAgentStatic {
      keepOpen(): Agent;
      close(callback?: (err: any) => void): Agent;
    }
  }
}

declare function chaiHttp(chai: any, utils: any): void;

export default chaiHttp;

declare const request: Chai.ChaiHttpRequest;

export {request};
