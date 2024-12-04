import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { CartController } from "./cart.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CartController.getAllCart
);

export const CartRoutes = router;
