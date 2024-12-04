import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import { globalErrorHandler, notFoundHandler } from "./app/middlewares";
import { httpStatus } from "./shared";

const app: Application = express();

app.use(cors());
app.use(cookieParser());

//? Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//? Testing Welcome Root Route
app.get("/", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    success: true,
    message: "Welcome to the Urban Mart APIs",
  });
});

//? APIs v1 All Routes
app.use("/api/v1", router);

//? API Health Check
import os from "os";

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    loadAverage: os.loadavg(),
    timestamp: new Date().toISOString(),
  });
});

//! Global Error Handler
app.use(globalErrorHandler);

//? Not Found Handler
app.use(notFoundHandler);

export default app;
