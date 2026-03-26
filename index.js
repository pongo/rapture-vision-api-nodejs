import "dotenv/config";
// dotenv must be first
import { createServer } from "./src/server/server.js";
import { checkSenya } from "./src/services/senya/senya-service.js";
// import { Err } from "./src/utils/result.js";

const port = Number(process.env.PORT || 3000);

// async function initCheckSenya() {
//   if (process.env.DISABLE_CHECK_SENYA === "on") {
//     return async () => Err("checkSenya disabled by environment variable");
//   }
//
//   const { checkSenya } = await import("./src/services/senya/senya-service.js");
//   return checkSenya;
// }

const app = createServer({
  checkSenya,
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
