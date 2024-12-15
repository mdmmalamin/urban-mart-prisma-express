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

router.patch("/profile", auth(UserRole.VENDOR), VendorController.updateMyInfo);

export const VendorRoutes = router;
