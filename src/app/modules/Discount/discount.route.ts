import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { DiscountController } from "./discount.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  DiscountController.getAllDiscount
);

export const DiscountRoutes = router;
