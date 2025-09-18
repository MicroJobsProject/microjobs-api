//DEPENDENCIES
import "dotenv/config";
import dotenv from "dotenv";

dotenv.config();

import http from "node:http";

//NATIVE
import app from "./app.js";

const port = process.env.PORT || 3000;

/**
 * CREATE HTTP SERVER
 */

const server = http.createServer(app);

server.on("error", (err) => console.log(err));
server.on("listening", () => {
  console.log(`Server started on http://localhost:${port}`);
});
server.listen(port);
