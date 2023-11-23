import mongoose from "mongoose";
import { MONGOURL } from "./envs";

export const connectDB = async () => {
  try {
    if (!MONGOURL) throw new Error("MONGO URL not found");
    await mongoose.connect(MONGOURL).then((res) => {});
    console.log("Connected");
  } catch (error: any) {
    console.error(error.message);
  }
};
