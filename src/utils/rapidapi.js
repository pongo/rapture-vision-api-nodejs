"use strict";

const axios = require("axios").default;
const { Ok, Err } = require("./result");

const HOUR = 3600;

async function requestRapidApi(method, url, { host, params, parseLimitsFn = undefined }) {
  const parseLimits = parseLimitsFn ?? _parseLimits;
  try {
    const response = await axios.request({
      method,
      url,
      params,
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": host,
      },
    });

    return Ok({
      ...parseLimits(response),
      data: response.data,
    });
  } catch (error) {
    console.error(error);

    if (error.response.status === 429) {
      // балансировщик прекращает делать запросы если remaining < 3
      // поэтому 429 ошибки не должно возникать.
      //
      // если же она возникла, то это или лимит запросов в минуту/час, или изменения тарифов апи.
      // в общем, это что-то необычное. поэтому reset делаем 1 час
      return Err(error.message, { remaining: 0, reset: HOUR });
    }

    return Err(error, parseLimits(error.response));
  }

  function _parseLimits(response) {
    return {
      remaining: parseInt(response.headers["x-ratelimit-requests-remaining"], 10),
      reset: parseInt(response.headers["x-ratelimit-requests-reset"], 10),
    };
  }
}

async function requestRapidApiFetch(
  method,
  url,
  { host, params = undefined, body = undefined, parseLimitsFn = undefined, parseJSON = true },
) {
  const parseLimits = parseLimitsFn ?? _parseLimits;

  const options = {
    method,
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": host,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  if (params) {
    const queryParams = new URLSearchParams(params).toString();
    const sign = url.includes("?") ? "&" : "?";
    url += `${sign}${queryParams}`;
  }

  try {
    const response = await fetch(url, options);
    const data = await (parseJSON ? response.json() : response.text());

    if (!response.ok) {
      throw { response, error: data };
    }

    return Ok({
      ...parseLimits(response),
      data,
    });
  } catch (error) {
    console.error(error);

    if (error.response?.status === 429) {
      // балансировщик прекращает делать запросы если remaining < 3
      // поэтому 429 ошибки не должно возникать.
      //
      // если же она возникла, то это или лимит запросов в минуту/час, или изменения тарифов апи.
      // в общем, это что-то необычное. поэтому reset делаем 1 час
      return Err(error.message, { remaining: 0, reset: HOUR });
    }

    return Err(error, parseLimits(error.response));
  }

  function _parseLimits(response) {
    return {
      remaining: parseInt(response.headers.get("x-ratelimit-requests-remaining"), 10),
      reset: parseInt(response.headers.get("x-ratelimit-requests-reset"), 10),
    };
  }
}

module.exports = { requestRapidApi, requestRapidApiFetch };
