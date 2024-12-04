import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { PaymentController } from "./payment.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PaymentController.getAllPayment
);

export const PaymentRoutes = router;
