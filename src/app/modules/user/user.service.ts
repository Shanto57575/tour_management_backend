import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/queryBuilder";
import { userSearchableFields } from "./user.constant";

const createUserService = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = await payload;

  const isUserExists = await User.findOne({ email });

  if (isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exists");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

const updateUserService = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Your are not authorized");
    }

    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Your are not authorized");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role == Role.GUIDE) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Your are not authorized");
    }
  }
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

const getAllUsersServices = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const allUsers = queryBuilder
    .filter()
    .search(userSearchableFields)
    .fields()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    allUsers.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    users: data,
  };
};

const getProfileService = async (userId: string) => {
  const result = await User.findById(userId).select("-password");
  return result;
};

const getSingleUserService = async (userId: string) => {
  return await User.findById(userId).select("-password");
};

export const UserServices = {
  createUserService,
  getAllUsersServices,
  getSingleUserService,
  getProfileService,
  updateUserService,
};
