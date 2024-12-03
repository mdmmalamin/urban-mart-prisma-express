import express from "express";
import { UserRoute } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoute,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
