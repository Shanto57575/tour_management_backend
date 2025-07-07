/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
  try {
    console.log(envVars.NODE_ENV);
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

startServer();

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

// Promise.reject(new Error("Error khaisi...."));
// throw new Error("unCaught exception error khaisi");
