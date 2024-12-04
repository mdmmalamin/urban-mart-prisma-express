import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { ReviewController } from "./review.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  ReviewController.getAllReview
);

export const ReviewRoutes = router;
