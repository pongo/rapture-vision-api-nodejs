import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import { writeJsonFile } from "write-json-file";
import { Err, isErr, isResult, Ok } from "./result.js";
import { sanitizeFilename } from "./sanitize-filename.js";
import { StacklessError } from "./stackless-error.js";

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
 * @param {import("./fetch-factory.d.ts").FactoryOptions<T, F>} factoryOptions
 * @returns {import("./fetch-factory.d.ts").FetchFn<T>}
 */
export function FetchFactory(apiName, factoryOptions) {
  const {
    fetchFn,
    parseFn,
    checkFn,
    tmpFileNameFn,
    checkUrlFn = undefined,
    loadFn = undefined,
    saveFn = undefined,
  } = factoryOptions;
  assert(checkFn !== undefined);
  assert(tmpFileNameFn !== undefined);

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
      return checkFn(result) ? Ok(result) : Err(new FetchEmpty(url));
    } catch (error) {
      return Err(new FetchCatchError(url, error));
    }

    function _tmpFilePath() {
      assert(tmpFileNameFn !== undefined);
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
        if (options.fakeLoadFromDiskData !== undefined) {
          return options.fakeLoadFromDiskData;
        }
        const load = loadFn ?? loadJson;
        const loadedData = await load(_tmpFilePath());
        const data = loadedData?.data;
        if (!data) {
          throw new StacklessError(`Empty data in ${_tmpFilePath()}`, { url });
        }
        return Ok(data);
      }

      const res = await fetchFn(url);
      return isResult(res) ? res : Ok(res);
    }
  };
}

async function loadJson(path) {
  return JSON.parse(await fs.readFile(path, "utf8"));
  // try {
  //   return JSON.parse(await fs.readFile(path, "utf8"));
  // } catch {
  //   return undefined;
  // }
}

/**
 * @param {string} apiName
 * @param {string} filename
 * @returns {string}
 */
export function getTmpFilePath(apiName, filename) {
  return `./tmp/${apiName}/${sanitizeFilename(filename)}.json`;
}
