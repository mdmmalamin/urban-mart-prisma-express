import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { OrderController } from "./order.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  OrderController.getAllOrder
);

export const OrderRoutes = router;
