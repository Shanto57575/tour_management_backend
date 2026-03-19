import { Router } from "express";
import { districtController } from "./district.controller";

const router = Router();

router.get("/", districtController.getDistrictsByDivision);

export const DistrictRoutes = router;
