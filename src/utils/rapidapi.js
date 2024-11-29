import axios from "axios";
import { Err, Ok } from "./result.js";

const HOUR = 3600;

/** @type {import("./rapidapi.d.ts").requestRapidApi}  */
export async function requestRapidApi(method, url, { host, params, parseLimitsFn = undefined }) {
  const parseLimits = parseLimitsFn ?? parseLimitsRapidApi;
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
}

function parseLimitsRapidApi(response) {
  return {
    remaining: Number.parseInt(response.headers["x-ratelimit-requests-remaining"], 10),
    reset: Number.parseInt(response.headers["x-ratelimit-requests-reset"], 10),
  };
}

/** @type {import("./rapidapi.d.ts").requestRapidApiFetch}  */
export async function requestRapidApiFetch(
  method,
  url,
  { host, params = undefined, body = undefined, parseLimitsFn = undefined, parseJSON = true },
) {
  const parseLimits = parseLimitsFn ?? parseLimitsRapidApiFetch;

  const options = {
    method,
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY ?? "",
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
      const errorMessage = `${response.status} ${response.statusText}`;
      if (response.status === 429) {
        // балансировщик прекращает делать запросы если remaining < 3
        // поэтому 429 ошибки не должно возникать.
        //
        // если же она возникла, то это или лимит запросов в минуту/час, или изменения тарифов апи.
        // в общем, это что-то необычное. поэтому reset делаем 1 час
        return Err(errorMessage, { remaining: 0, reset: HOUR });
      }

      return Err(errorMessage, parseLimits(response));
    }

    return Ok({
      ...parseLimits(response),
      data,
    });
  } catch (error) {
    console.error(error);
    return Err(error.message, { remaining: -1, reset: 0, error });
  }
}

function parseLimitsRapidApiFetch(response) {
  return {
    remaining: Number.parseInt(response.headers.get("x-ratelimit-requests-remaining"), 10),
    reset: Number.parseInt(response.headers.get("x-ratelimit-requests-reset"), 10),
  };
}
