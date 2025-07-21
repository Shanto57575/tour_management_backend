import AppError from "../../errorHelpers/AppError";
import { IDivision } from "./division.interface";
import httpStatus from "http-status-codes";
import { Division } from "./division.model";
import { QueryBuilder } from "../../utils/queryBuilder";
import { divisionSearchableFields } from "./division.constant";

const createDivisionService = async (payload: Partial<IDivision>) => {
  if (!payload.name) {
    throw new AppError(httpStatus.BAD_REQUEST, "Name is required");
  }

  const isDivisionExists = await Division.findOne({ name: payload.name });

  if (isDivisionExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "division already exists");
  }

  const division = await Division.create(payload);

  return division;
};

const getAllDivisionService = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Division.find(), query);
  const allDivisions = queryBuilder
    .filter()
    .search(divisionSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    allDivisions.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    division: data,
  };
};

const getSingleDivisionService = async (slug: string) => {
  return await Division.findOne({ slug });
};

const updateDivisionService = async (
  divisionId: string,
  payload: Partial<IDivision>
) => {
  const updatedDivision = await Division.findByIdAndUpdate(
    divisionId,
    payload,
    {
      runValidators: true,
      new: true,
    }
  );
  return updatedDivision;
};

const DeleteDivisionService = async (divisionId: string) => {
  const deletedDivision = await Division.findByIdAndDelete(divisionId);
  if (!deletedDivision) {
    throw new AppError(httpStatus.NOT_FOUND, "division not found");
  }
  return deletedDivision;
};

export const divisionService = {
  createDivisionService,
  getAllDivisionService,
  getSingleDivisionService,
  updateDivisionService,
  DeleteDivisionService,
};
