import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { AdminController } from "./admin.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.getAllAdmin
);

export const AdminRoutes = router;
