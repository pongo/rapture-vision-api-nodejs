"use strict";

const fs = require("node:fs/promises");
const { Ok, Err, isErr } = require("./result");
const { StacklessError } = require("./stackless-error");
const { sanitizeFilename } = require("./sanitize-filename");
const writeJsonFile = require("write-json-file");

class FetchCatchError extends Error {
  constructor(url, catchedError) {
    super(`${catchedError.message} for "${url}"`);
    this.catchedError = catchedError;
    this.name = this.constructor.name;
  }
}

// TODO: переименовать. ошибка возвращается если не проходит checkFn
class FetchEmpty extends StacklessError {
  constructor(url) {
    super(`Empty fetch for "${url}"`);
  }
}

/**
 * @template T
 * @template F
 * @param {string} apiName
 * @param {import("./fetch-factory").FactoryOptions<T, F>} factoryOptions
 * @returns {import("./fetch-factory").FetchFn<T>}
 */
function FetchFactory(apiName, factoryOptions) {
  const {
    fetchFn,
    parseFn,
    checkFn,
    tmpFileNameFn,
    checkUrlFn = undefined,
    loadFn = undefined,
    saveFn = undefined,
  } = factoryOptions;
  return async function (url, options = {}) {
    const { loadFromDisk = false, saveToDisk = false } = options;
    try {
      _checkUrl();

      const dataResult = await _fetch();
      if (isErr(dataResult)) {
        return dataResult;
      }

      const data = dataResult.value;
      if (saveToDisk) {
        await _save(data);
      }

      const result = await parseFn(data, url, options);
      if (checkFn(result)) {
        return Ok(result);
      } else {
        return Err(new FetchEmpty(url));
      }
    } catch (e) {
      return Err(new FetchCatchError(url, e));
    }

    function _tmpFilePath() {
      return getTmpFilePath(apiName, tmpFileNameFn(url));
    }

    async function _save(data) {
      const save = saveFn ?? writeJsonFile;
      await save(_tmpFilePath(), { url, data });
    }

    function _checkUrl() {
      if (checkUrlFn == null) return;
      if (checkUrlFn(url)) return;
      throw new StacklessError("Invalid url", { url });
    }

    async function _fetch() {
      if (loadFromDisk) {
        const load = loadFn ?? loadJson;
        const data = (await load(_tmpFilePath()))?.data;
        if (!data) {
          throw new StacklessError(`Empty data in ${_tmpFilePath()}`, { url });
        }
        return Ok(data);
      }

      const res = await fetchFn(url);
      return res.isOk || res.isErr ? res : Ok(res);
    }
  };
}

async function loadJson(path) {
  return JSON.parse(await fs.readFile(path, "utf-8"));
  // try {
  //   return JSON.parse(await fs.readFile(path, "utf-8"));
  // } catch {
  //   return undefined;
  // }
}

function getTmpFilePath(apiName, filename) {
  return `./tmp/${apiName}/${sanitizeFilename(filename)}.json`;
}

module.exports = { FetchFactory, getTmpFilePath };
