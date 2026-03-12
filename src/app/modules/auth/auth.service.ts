/* eslint-disable @typescript-eslint/no-non-null-assertion */
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { IAuthProvider, IsActive } from "../user/user.interface";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmail";

const getNewAccessTokenService = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};

const changePasswordService = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user?.password as string,
  );

  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not match");
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  user!.save();
};

const resetPasswordService = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>,
) => {
  const isUserExits = await User.findById(payload.id);
  if (!isUserExits) {
    throw new AppError(401, "User does not exists");
  }

  const hashedPassword = await bcryptjs.hash(
    payload.password,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  isUserExits.password = hashedPassword;
  await isUserExits.save();
};

const setPasswordService = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (
    user.password &&
    user.auths.some((providerObject) => providerObject.provider === "google")
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already set your password.Now you can change the password from your profile page!",
    );
  }

  const hashedPassword = await bcryptjs.hash(
    plainPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  const credentialProvider: IAuthProvider = {
    provider: "credentials",
    providerId: user.email,
  };

  const auths: IAuthProvider[] = [...user.auths, credentialProvider];

  user.password = hashedPassword;
  user.auths = auths;
  await user.save();
};

const forgotPasswordService = async (email: string) => {
  const isUserExists = await User.findOne({ email });

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  if (isUserExists.isActive == IsActive.BLOCKED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `user is Blocked ${isUserExists.isActive}`,
    );
  }

  if (isUserExists.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "user is Deleted");
  }
  if (!isUserExists.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "user is not verified!");
  }

  const jwtPayload = {
    userId: isUserExists._id,
    email: isUserExists.email,
    role: isUserExists.role,
  };

  const resetToken = jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExists._id}&token=${resetToken}`;

  sendEmail({
    to: isUserExists.email,
    subject: "Password Reset",
    templateName: "forgetPassword",
    templateData: {
      name: isUserExists.name,
      resetUILink,
    },
  });
};

export const AuthServices = {
  getNewAccessTokenService,
  changePasswordService,
  resetPasswordService,
  setPasswordService,
  forgotPasswordService,
};
