import mongoose from "mongoose";
const { Schema } = mongoose;

enum UserRole {
  client = "client",
  admin = "admin",
}

export interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  role: UserRole;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
const UserSchema = new Schema<IUser>(
  {
    username: String,
    role: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
