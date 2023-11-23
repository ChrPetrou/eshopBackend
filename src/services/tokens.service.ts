import TokenModel, { IToken } from "@models/tokenModel";
import { IUser } from "@models/userModel";
import { randomBytes } from "crypto";
import mongoose, { HydratedDocument } from "mongoose";

export const TOKEN_TYPES = Object.freeze({
  refresh_token: "refresh_token",
});

const REFRESH_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

const tokensService = {
  createRefreshToken: async (
    userId: string,
    retry: number = 0
  ): Promise<IToken> => {
    const token = randomBytes(128).toString("hex");
    const existingToken = await TokenModel.findOne({
      token,
      type: TOKEN_TYPES.refresh_token,
    });
    console.log(token, existingToken);

    if (!!existingToken) {
      if (retry > 3) throw new Error("Too many hits");
      return tokensService.createRefreshToken(userId, retry + 1);
    }
    return TokenModel.create({
      token_type: TOKEN_TYPES.refresh_token,
      user: new mongoose.Types.ObjectId(userId),
      expire: new Date(Date.now() + REFRESH_TOKEN_DURATION),
      token,
    });
  },
  validateRefreshToken: async (token: string): Promise<IUser | null> => {
    const authToken: any = await TokenModel.findOne({
      token: token,
    }).populate("user");
    if (!authToken) {
      return null;
    }
    if (new Date() > authToken.expire) {
      return null;
    }
    return authToken.user as IUser;
  },
};

export default tokensService;
