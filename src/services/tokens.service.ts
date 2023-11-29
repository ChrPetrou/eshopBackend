import TokenModel, { IToken } from "@models/tokenModel";
import { IUser } from "@models/userModel";
import { randomBytes } from "crypto";
import mongoose, { HydratedDocument } from "mongoose";
import speakeasy from "speakeasy";

export const TOKEN_TYPES = Object.freeze({
  refresh_token: "refresh_token",
  twoFa: "2fa",
});

const REFRESH_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days
const TWOFA_TOKEN_DURATION = 1000 * 60 * 5; // 2 mins

const tokensService = {
  createRefreshToken: async (
    userId: string,
    retry: number = 0
  ): Promise<IToken> => {
    const userExistingTokens = await TokenModel.find({
      user: userId,
      type: TOKEN_TYPES.refresh_token,
    }).sort("createdAt");

    // if (userExistingTokens.length > 3) {
    //   await TokenModel.deleteMany({
    //     _id: {$in:  }
    //   })
    // }

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
      token_type: TOKEN_TYPES.refresh_token,
    }).populate("user");
    if (!authToken) {
      return null;
    }
    if (new Date() > authToken.expire) {
      return null;
    }
    return authToken.user as IUser;
  },
  create2faToken: async (
    userId: string,
    retry: number = 0
  ): Promise<IToken & { code: string }> => {
    const token = randomBytes(128).toString("hex");
    const code = speakeasy.generateSecret({ length: 6 });

    const existingToken = await TokenModel.findOne({
      token,
      type: TOKEN_TYPES.twoFa,
    });
    console.log(token, existingToken);

    if (!!existingToken) {
      if (retry > 3) throw new Error("Too many hits");
      return tokensService.create2faToken(userId, retry + 1);
    }
    return TokenModel.create({
      token_type: TOKEN_TYPES.twoFa,
      user: new mongoose.Types.ObjectId(userId),
      expire: new Date(Date.now() + TWOFA_TOKEN_DURATION),
      token,
      code,
    }) as Promise<IToken & { code: string }>;
  },
  validate2faToken: async (
    token: string,
    code: string
  ): Promise<IUser | null> => {
    const authToken: any = await TokenModel.findOne({
      token_type: TOKEN_TYPES.twoFa,
      token: token,
    }).populate("user");
    if (!authToken) {
      return null;
    }
    if (authToken.code !== code) {
      return null;
    }
    if (new Date() > authToken.expire) {
      return null;
    }
    return authToken.user as IUser;
  },
};

export default tokensService;
