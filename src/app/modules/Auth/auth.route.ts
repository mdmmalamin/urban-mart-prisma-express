import express from "express";
import { AuthController } from "./auth.controller";

const router = express.Router();

router.post("/login", AuthController.loginUser);

// router.post("/refresh-token", AuthController.refreshToken);

// router.post(
//   "/change-password",
//   auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
//   AuthController.changePassword
// );

// router.post("/forget-password", AuthController.forgetPassword);

// router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;