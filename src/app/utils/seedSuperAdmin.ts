import bcryptjs from "bcryptjs";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });
    if (isSuperAdminExists) {
      console.log(`Super Admin already exists!`);
      return;
    }

    const hashedPassword = await bcryptjs.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND)
    );
    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: envVars.SUPER_ADMIN_EMAIL,
    };

    const payload: IUser = {
      name: "Super Admin",
      email: envVars.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      auths: [authProvider],
      isVerified: true,
    };

    const superAdmin = await User.create(payload);
    if (superAdmin) {
      console.log("super admin created successfully!!!");
    }
    console.log(superAdmin);
  } catch (error) {
    console.log(error);
  }
};
