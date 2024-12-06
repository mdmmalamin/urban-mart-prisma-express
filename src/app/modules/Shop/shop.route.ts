import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { ShopController } from "./shop.controller";
import { fileUploader, formDataParser } from "../../../helpers";

const router = express.Router();

router.get("/my-shop", auth(UserRole.VENDOR), ShopController.getMyShop);

router.get("/", ShopController.getAllShop);

router.get("/:id", ShopController.getShop);

router.post(
  "/",
  auth(UserRole.VENDOR),
  fileUploader.upload.single("logo"),
  formDataParser,
  ShopController.createShop
);

export const ShopRoutes = router;
