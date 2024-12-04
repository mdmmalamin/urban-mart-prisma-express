import express from "express";
import { auth } from "../../middlewares";
import { UserRole } from "@prisma/client";
import { FollowController } from "./follow.controller";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  FollowController.getAllFollow
);

export const FollowRoutes = router;
