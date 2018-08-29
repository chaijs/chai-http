// Definitions by: Wim Looman <https://github.com/Nemo157>
//                 Liam Jones <https://github.com/G1itcher>
//                 Federico Caselli <https://github.com/CaselIT>
//                 Bas Luksenburg <https://github.com/bas-l>
//                 Austin Cawley-Edwards <https://github.com/austince>
// TypeScript Version: 3.0
/// <reference types="chai" />
import * as request from 'superagent';

// Merge namespace with global chai
declare global {
    namespace Chai {
        interface ChaiStatic {
            request: ChaiHttpRequest;
        }

        interface ChaiHttpRequest {
            (server: any): ChaiHttp.Agent;

            agent(server: any): ChaiHttp.Agent;

            addPromises(promiseConstructor: PromiseConstructorLike): void;
        }

        interface Assertion {
            redirectTo(location: string): Assertion;

            param(key: string, value?: string): Assertion;

            cookie(key: string, value?: string): Assertion;

            status(code: number): Assertion;

            statusCode(code: number): Assertion;

            header(key: string, value?: string | RegExp): Assertion;

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
        interface Response extends request.Response {}
        interface Agent extends request.SuperAgentStatic {
            keepOpen(): Agent;
            close(callback?: (err: any) => void): Agent;
        }
    }
}

declare function chaiHttp(chai: any, utils: any): void;

export = chaiHttp;
