// import type { Express } from "express";
// import type inject from "light-my-request";
// import type { ServerConfig } from "../server/server.d.ts";

export function formatErr<T, E>(res: Result<T, E>): string;

// interface MyResponse {
//   statusCode: number;
//   body: string;
// }
//
// declare class ServerTestBase {
//   constructor(app: Express);
//   start(): Promise<void>;
//   stop(): Promise<void>;
//   post(url: string, body: string | unknown): Promise<MyResponse>;
// }

// export declare class ServerTestFetch extends ServerTestBase {}
// export declare class ServerTestInject extends ServerTestBase {}
// export declare class ServerTest extends ServerTestBase {}

// export function tpost(app: Express, url: string, body: unknown): Promise<inject.Response>;

// export const notImplementedServerConfig: ServerConfig;

export function createLogManager(): { silent: () => void; restore: () => void };
