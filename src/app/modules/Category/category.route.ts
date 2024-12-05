import express from "express";
import { CategoryController } from "./category.controller";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get("/", CategoryController.getAllCategory);

router.post(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CategoryController.createCategory
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CategoryController.updateCategory
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;
