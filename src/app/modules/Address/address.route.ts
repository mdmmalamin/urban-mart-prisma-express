import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { AddressController } from "./address.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AddressController.getAllAddress
);

export const AddressRoutes = router;
