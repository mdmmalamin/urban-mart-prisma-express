import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { ShopController } from "./shop.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ShopController.getAllShop
);

export const ShopRoutes = router;
