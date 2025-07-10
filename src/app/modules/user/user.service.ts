import { IUser } from "./user.interface";
import { User } from "./user.model";

const createUserService = async (payload: Partial<IUser>) => {
  const { name, email } = payload;
  const user = await User.create({
    name,
    email,
  });
  return user;
};

const getAllUsersServices = async () => {
  const allUsers = await User.find();
  return allUsers;
};

export const UserServices = {
  createUserService,
  getAllUsersServices,
};
