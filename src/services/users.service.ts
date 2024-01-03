import UserModel, { IUser } from "@models/userModel";
import bcrypt from "bcrypt";
const saltRounds = 10;

const usersService = {
  createUser: async (value: {
    username: string;
    password: string;
    email: string;
  }): Promise<IUser> => {
    const existingUser = await UserModel.findOne({ email: value.email });
    if (!!existingUser) {
      throw new Error("Email already exists");
    }
    let password = await bcrypt.hash(value.password, saltRounds);
    return UserModel.create({
      username: value.username,
      email: value.email.toLowerCase(),
      password,
      isauth: false,
    });
  },
  getUserByEmail: async (email: string): Promise<IUser | null> => {
    return UserModel.findOne({
      email,
    });
  },
  checkUserPassword: async (
    user: IUser,
    password: string
  ): Promise<boolean> => {
    return bcrypt.compare(password, user.password);
  },
  updateUserAuth: async (email: string): Promise<IUser | null> => {
    return UserModel.findOneAndUpdate(
      {
        email,
      },
      { isauth: true }
    );
  },
};

export default usersService;
