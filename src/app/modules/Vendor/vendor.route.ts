import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { VendorController } from "./vendor.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  VendorController.getAllVendor
);

export const VendorRoutes = router;
