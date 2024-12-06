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

router.post("/:id", auth(UserRole.CUSTOMER), CartController.addToCart);

router.patch(
  "/:id",
  auth(UserRole.CUSTOMER),
  CartController.changeCartItemQuantity
);

router.get("/my-carts", auth(UserRole.CUSTOMER), CartController.getMyCarts);

export const CartRoutes = router;
