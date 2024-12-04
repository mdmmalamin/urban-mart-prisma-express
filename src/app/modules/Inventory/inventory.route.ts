import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { InventoryController } from "./inventory.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  InventoryController.getAllInventory
);

export const InventoryRoutes = router;
