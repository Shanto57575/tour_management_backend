import { Request, Response } from "express";
import { District } from "./district.model";

const getDistrictsByDivision = async (req:Request, res:Response) => {
  const { division } = req.query;
  const districts = await District.find({ division }).sort({ name: 1 });
  res.json({ success: true, data: districts });
};

export const districtController = {
  getDistrictsByDivision
}