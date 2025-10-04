//DEPENDENCIES
import "dotenv/config";
import http from "node:http";

//NATIVE
import app from "./app.js";

const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

const server = http.createServer(app);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Please use a different port.`
    );
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

server.on("listening", () => {
  console.log(`✓ Server started on http://localhost:${port}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL}`);
});

server.listen(port);

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log("✓ HTTP server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (isProduction) {
    gracefulShutdown("UNHANDLED_REJECTION");
  }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});
