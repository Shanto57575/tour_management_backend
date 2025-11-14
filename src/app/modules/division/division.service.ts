import AppError from "../../errorHelpers/AppError";
import { IDivision } from "./division.interface";
import httpStatus from "http-status-codes";
import { Division } from "./division.model";
import { QueryBuilder } from "../../utils/queryBuilder";
import { divisionSearchableFields } from "./division.constant";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import slugify from "slugify";

const createDivisionService = async (payload: Partial<IDivision>) => {
  if (!payload.name) {
    throw new AppError(httpStatus.BAD_REQUEST, "Name is required");
  }

  const slug = slugify(payload.name, { lower: true, trim: true });

  const isDivisionExists = await Division.findOne({ name: payload.name });

  if (isDivisionExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "division already exists");
  }

  const division = await Division.create({ ...payload, slug });

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
  const existingDivision = await Division.findById(divisionId);
  if (!existingDivision) {
    throw new AppError(httpStatus.NOT_FOUND, "Division Not Found!");
  }

  let slug;
  if (payload.name) {
    slug = slugify(payload.name, { lower: true, trim: true });
  }

  const updatedDivision = await Division.findByIdAndUpdate(
    divisionId,
    { ...payload, slug },
    {
      runValidators: true,
      new: true,
    }
  );

  if (payload.thumbnail && existingDivision.thumbnail) {
    await deleteImageFromCloudinary(existingDivision.thumbnail);
  }
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
