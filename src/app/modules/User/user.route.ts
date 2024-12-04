import express from "express";
import { UserController } from "./user.controller";
import { fileUploader, formDataParser } from "../../../helpers";
import { UserRole } from "@prisma/client";
import { auth } from "../../middlewares";

const router = express.Router();

router.post(
  "/create-admin", //? specific Route for creating an admin
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), //? for Authorization guard
  fileUploader.upload.single("file"), //? for multer file upload
  formDataParser, //? for formData stringify to JSON.parse
  // validateRequest(UserValidation.createAdminSchema), //? for Zod validation schema
  UserController.createAdmin //? for create an admin service controller
);

router.post(
  "/create-vendor",
  // validateRequest(UserValidation.createVendorSchema),
  UserController.createVendor
);

router.post(
  "/create-customer",
  // validateRequest(UserValidation.createCustomerSchema),
  UserController.createCustomer
);

export const UserRoute = router;
