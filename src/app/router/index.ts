import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    element: UserRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.element);
});
