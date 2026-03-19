/* eslint-disable no-console */
import app from "./app";
import { Server } from "http";
import mongoose from "mongoose";
import { envVars } from "./app/config/env";
import { connectRedis } from "./app/config/redis.config";
// import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";
// import { seedDistricts } from "./scripts/seedDistrict";

let server: Server;

const startServer = async () => {
  try {
    const result = await mongoose.connect(envVars.DB_URL);

    console.log(
      `MONGODB CONNECTED!!! CONNECTION HOST: ${result.connection.host}`
    );

    server = app.listen(envVars.PORT, () => {
      console.log(`server is running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  await connectRedis();
  await startServer();
  // await seedSuperAdmin();
  // await seedDistricts()
})();

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection detected... server shutting down...", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log("uncaught exception detected... server shutting down...", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// Promise.reject(new Error("Got Error...."));
// throw new Error("Got unCaught exception error");
