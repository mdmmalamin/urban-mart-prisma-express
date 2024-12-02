import { Server } from "http";
import app from "./app";
import config from "./config";

const port = config.port || 3000;

async function main() {
  const server: Server = app.listen(port, () => {
    console.log("Urban Mart Management System Is Listening On ", port);
  });
}

main();
