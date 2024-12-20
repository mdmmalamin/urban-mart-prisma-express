import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { CustomerController } from "./customer.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CustomerController.getAllCustomer
);

export const CustomerRoutes = router;
