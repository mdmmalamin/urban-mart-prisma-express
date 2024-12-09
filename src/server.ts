import { Server } from "http";
import app from "./app";
import config from "./config";
import seedSuperAdmin from "./app/DB";

const port = config.port || 5000;

let server: Server;

async function main() {
  try {
    await seedSuperAdmin();
    server = app.listen(port, () => {
      console.log(`Urban Mart app is listening on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

process.on("unhandledRejection", (err) => {
  console.log(`😈 unhandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
