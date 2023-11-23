import mongoose, { Schema } from "mongoose";

export interface IToken {
  _id: mongoose.Types.ObjectId;
  token_type: string;
  user: mongoose.Types.ObjectId;
  token: string;
  expire: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const TokenSchema = new mongoose.Schema<IToken>(
  {
    token_type: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    token: { type: String },
    expire: { type: Date },
  },
  { timestamps: true }
);

//Compile model from schema
const TokenModel = mongoose.model<IToken>("TokenModel", TokenSchema);
export default TokenModel;
