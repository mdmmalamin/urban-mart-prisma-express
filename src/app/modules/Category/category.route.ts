import express from "express";
import { CategoryController } from "./category.controller";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CategoryController.createCategory
);

router.get("/", CategoryController.getAllCategory);

export const CategoryRoutes = router;
