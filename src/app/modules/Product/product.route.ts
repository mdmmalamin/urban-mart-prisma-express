import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { ProductController } from "./product.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ProductController.getAllProduct
);

export const ProductRoutes = router;
