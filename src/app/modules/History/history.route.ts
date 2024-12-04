import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { HistoryController } from "./history.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  HistoryController.getAllHistory
);

export const HistoryRoutes = router;
