import express from "express";
import { UserController } from "./user.controller";

const router = express.Router();

router.post(
  "/create-admin", //? specific Route for creating an admin
  UserController.createAdmin //? for create an admin service controller
);

export const UserRoute = router;
