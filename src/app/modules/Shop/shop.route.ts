import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { ShopController } from "./shop.controller";
import { fileUploader, formDataParser } from "../../../helpers";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ShopController.getAllShop
);

router.post(
  "/",
  auth(UserRole.VENDOR),
  fileUploader.upload.single("logo"),
  formDataParser,
  ShopController.createShop
);

export const ShopRoutes = router;
