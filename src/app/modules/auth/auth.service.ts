import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { generateToken } from "../../utils/jwt";
import { envVars } from "../../config/env";

const credentialsLoginService = async (payload: Partial<IUser>) => {
  const { email, password } = await payload;
  const isUserExists = await User.findOne({ email });
  if (!isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "user does not exist");
  }
  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExists.password as string
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid credentials");
  }

  //   const { password, ...rest } = isUserExists;
  const jwtPayload = {
    userId: isUserExists._id,
    email: isUserExists.email,
    role: isUserExists.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  return {
    accessToken,
  };
};

export const AuthServices = {
  credentialsLoginService,
};
