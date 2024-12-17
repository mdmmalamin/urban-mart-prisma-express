import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { ProductController } from "./product.controller";
import { fileUploader, formDataParser } from "../../../helpers";

const router = express.Router();

router.get(
  "/",
  // auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ProductController.getAllProduct
);

router.get("/:id", ProductController.getProduct);

router.post(
  "/",
  auth(UserRole.VENDOR),
  fileUploader.upload.array("images", 3),
  formDataParser,
  ProductController.createProduct
);

router.post(
  "/:id/duplicate",
  auth(UserRole.VENDOR),
  ProductController.duplicateProduct
);

router.patch("/:id", auth(UserRole.VENDOR), ProductController.updateProduct);

router.patch(
  "/:id/status",
  auth(UserRole.VENDOR),
  ProductController.statusChange
);

router.delete("/:id", auth(UserRole.VENDOR), ProductController.deleteProduct);

export const ProductRoutes = router;
