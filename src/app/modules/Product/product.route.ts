import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { ProductController } from "./product.controller";
import { fileUploader, formDataParser } from "../../../helpers";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ProductController.getAllProduct
);

router.post(
  "/",
  auth(UserRole.VENDOR),
  fileUploader.upload.array("images"),
  formDataParser,
  ProductController.createProduct
);

export const ProductRoutes = router;
