import "dotenv/config";
// dotenv must be first
import { startServer } from "./src/server/server.js";

const port = Number(process.env.PORT || 3000);

startServer(port, () => {
  console.log(`Server started on port ${port}`);
});
