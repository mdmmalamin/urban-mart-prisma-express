import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { ProductImageController } from "./ProductImage.controller";
import { fileUploader, formDataParser } from "../../../helpers";

const router = express.Router();

router.patch(
  "/:id",
  auth(UserRole.VENDOR),
  fileUploader.upload.array("images"),
  formDataParser,
  ProductImageController.updateImages
);

export const ProductImageRoutes = router;
