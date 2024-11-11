/* c8 ignore start */
/* node:coverage disable */

import inject from "light-my-request";
import assert from "node:assert/strict";

import { Err } from "../result.js";

class MyResponse {
  constructor({ statusCode, body }) {
    this.statusCode = statusCode;
    this.body = body;
  }
}

class ServerTestBase {
  constructor(app) {
    this.app = app;
  }

  async start() {}
  async stop() {}

  /**
   * @param {string} url
   * @param {string | unknown} body
   * @returns {Promise<MyResponse>}
   */
  // eslint-disable-next-line no-unused-vars
  async post(url, body) {
    throw new Error("Not implemented");
  }
}

// Тестирование реального сервера (с запуском и остановкой) с помощью fetch
// Нечто подобное рекомендуется гайдом https://github.com/testjavascript/nodejs-integration-tests-best-practices/
// eslint-disable-next-line no-unused-vars
class ServerTestFetch extends ServerTestBase {
  constructor(app) {
    super(app);
    this.listener = undefined;
    this.port = undefined;
  }

  start() {
    return new Promise((resolve) => {
      this.listener = this.app.listen(undefined, () => {
        this.port = this.listener.address().port;
        resolve(undefined);
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.listener.close(() => {
        resolve(undefined);
      });
    });
  }

  async post(url, body) {
    assert(url.startsWith("/"), "Url must start with /");
    const res = await fetch(`http://localhost:${this.port}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

    assert.equal(
      res.headers.get("content-type"),
      "application/json; charset=utf-8",
      "Only JSON is supported",
    );
    return new MyResponse({ statusCode: res.status, body: await res.text() });
    //     try {
    //       const port = this.app.address().port;
    //       const res = await fetch(`http://localhost:${port}${url}`, {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: typeof body === "string" ? body : JSON.stringify(body),
    //       });
    //       const data = await res.json();
    //
    //       if (!res.ok) {
    //         return Err(`${res.status}: ${res.statusText}`, data);
    //       }
    //
    //       return Ok({ data, status: res.status });
    //     } catch (error) {
    //       return Err(error);
    //     }
  }
}

// Тестирование при помощи https://github.com/fastify/light-my-request
// Плюсы:
// - раза в 2-3 быстрее, чем ServerTestFetch
// - разрабатывается авторами fastify, используется в нём самом
class ServerTestInject extends ServerTestBase {
  async post(url, body) {
    assert(url.startsWith("/"), "Url must start with /");
    const res = await inject(this.app, {
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      payload: typeof body === "string" ? body : JSON.stringify(body),
    });
    assert.equal(
      res.headers["content-type"],
      "application/json; charset=utf-8",
      "Only JSON is supported",
    );
    return new MyResponse({ statusCode: res.statusCode, body: res.body });
  }
}

// можно поменять реализацию: ServerTestInject, ServerTestFetch
export const ServerTest = ServerTestInject;

async function notImplemented() {
  return Err("Not implemented");
}

/** @type {import("../../server/server.d.ts").ServerConfig} */
export const notImplementedServerConfig = {
  getInstagram: notImplemented,
  getInstagramStory: notImplemented,
  getThreads: notImplemented,
  getTiktok: notImplemented,
  getTwitter: notImplemented,
  checkSenya: notImplemented,
};

/**
 * @param {MyResponse} res
 * @param {string} message
 */
export function assertValidationError(res, message) {
  assert.equal(res.statusCode, 400);
  const data = JSON.parse(res.body);
  assert.deepEqual(data, {
    ok: false,
    error: {
      code: 400,
      message,
    },
  });
}

/**
 * @param {MyResponse} res
 * @param {string} message
 * @param {string} [name]
 */
export function assertServiceReturnsErr(res, message, name) {
  assert.equal(res.statusCode, 200);
  const data = JSON.parse(res.body);
  const error = name == null ? { message } : { message, name };
  assert.deepEqual(data, { ok: false, error });
}

/**
 * @param {MyResponse} res
 * @param {string} error
 */
export function assertServiceThrow(res, error = "Internal Server Error") {
  assert.equal(res.statusCode, 500);
  const data = JSON.parse(res.body);
  assert.deepEqual(data, { error, status: 500 });
}
