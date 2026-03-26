import "dotenv/config";
// dotenv must be first
import { createServer } from "./src/server/server.js";
import { checkSenya } from "./src/services/senya/senya-service.js";

const port = Number(process.env.PORT || 3000);

const app = createServer({
  checkSenya,
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
