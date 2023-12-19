import mongoose, { Schema } from "mongoose";

export enum TOKEN_TYPE {
  refresh_token = "refresh_token",
  twoFa = "2fa",
}

export interface IToken {
  _id: mongoose.Types.ObjectId;
  token_type: TOKEN_TYPE;
  user: mongoose.Types.ObjectId;
  token: string;
  code?: string;
  expire: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const TokenSchema = new mongoose.Schema<IToken>(
  {
    token_type: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    token: { type: String },
    code: { type: String },
    expire: { type: Date },
  },
  { timestamps: true }
);

//Compile model from schema
const TokenModel = mongoose.model<IToken>("TokenModel", TokenSchema);
export default TokenModel;
