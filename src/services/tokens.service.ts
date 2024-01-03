import TokenModel, { IToken, TOKEN_TYPE } from "@models/tokenModel";
import { IUser } from "@models/userModel";
import { randomBytes } from "crypto";
import mongoose, { HydratedDocument } from "mongoose";
import speakeasy from "speakeasy";

const REFRESH_TOKEN_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days
const TWOFA_TOKEN_DURATION = 1000 * 60 * 5; // 5 mins

const tokensService = {
  createRefreshToken: async (
    userId: string,
    retry: number = 0
  ): Promise<IToken> => {
    const userExistingTokens = await TokenModel.find({
      user: userId,
      token_type: TOKEN_TYPE.refresh_token,
    }).sort([["_id", -1]]); // get all items desc by created date.

    if (userExistingTokens.length >= 3) {
      const latestId = userExistingTokens
        .slice(2)
        .map((element, _) => element?._id);

      await TokenModel.deleteMany({
        _id: {
          $in: latestId,
        },
        token_type: TOKEN_TYPE.refresh_token,
      });
    }

    const token = randomBytes(128).toString("hex");
    const existingToken = await TokenModel.findOne({
      token,
      token_type: TOKEN_TYPE.refresh_token,
    });

    if (!!existingToken) {
      if (retry > 3) throw new Error("Too many hits");
      return tokensService.createRefreshToken(userId, retry + 1);
    }

    return TokenModel.create({
      token_type: TOKEN_TYPE.refresh_token,
      user: new mongoose.Types.ObjectId(userId),
      expire: new Date(Date.now() + REFRESH_TOKEN_DURATION),
      token,
    });
  },

  validateRefreshToken: async (token: string): Promise<IUser | null> => {
    const authToken: any = await TokenModel.findOne({
      token: token,
      token_type: TOKEN_TYPE.refresh_token,
    }).populate("user");
    if (!authToken) {
      return null;
    }
    if (new Date() > authToken.expire) {
      return null;
    }
    return authToken.user as IUser;
  },

  //based on user_id create a nea 2fa token(only 1 can exist)
  create2faToken: async (
    userId: string,
    retry: number = 0
  ): Promise<IToken & { code: string }> => {
    const token = randomBytes(128).toString("hex");
    const code = speakeasy.generateSecret({ length: 5 });

    const existingToken = await TokenModel.findOne({
      token,
      token_type: TOKEN_TYPE.twoFa,
    });

    const userExistingTokens = await TokenModel.find({
      user: userId,
      token_type: TOKEN_TYPE.twoFa,
    }).sort("createdAt");

    if (userExistingTokens.length >= 1) {
      await TokenModel.deleteMany({
        user: { $in: userId },
        token_type: TOKEN_TYPE.twoFa,
      });
    }

    if (!!existingToken) {
      if (retry > 3) throw new Error("Too many hits");
      return tokensService.create2faToken(userId, retry + 1);
    }
    return TokenModel.create({
      token_type: TOKEN_TYPE.twoFa,
      user: new mongoose.Types.ObjectId(userId),
      expire: new Date(Date.now() + TWOFA_TOKEN_DURATION),
      token,
      code: code.base32,
    }) as Promise<IToken & { code: string }>;
  },
  validate2faToken: async (
    token: string,
    code: string
  ): Promise<IUser | null> => {
    const authToken: any = await TokenModel.findOne({
      token_type: TOKEN_TYPE.twoFa,
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
  createAuthToken: async (
    userId: string,
    retry: number = 0
  ): Promise<IToken & { code: string }> => {
    const token = randomBytes(128).toString("hex");
    const code = speakeasy.generateSecret({ length: 5 });

    const existingToken = await TokenModel.findOne({
      token,
      token_type: TOKEN_TYPE.validate,
    });

    const userExistingTokens = await TokenModel.find({
      user: userId,
      token_type: TOKEN_TYPE.validate,
    }).sort("createdAt");

    if (userExistingTokens.length >= 1) {
      await TokenModel.deleteMany({
        user: { $in: userId },
        token_type: TOKEN_TYPE.validate,
      });
    }

    if (!!existingToken) {
      if (retry > 3) throw new Error("Too many hits");
      return tokensService.create2faToken(userId, retry + 1);
    }
    return TokenModel.create({
      token_type: TOKEN_TYPE.validate,
      user: new mongoose.Types.ObjectId(userId),
      expire: new Date(Date.now() + TWOFA_TOKEN_DURATION),
      token,
      code: code.base32,
    }) as Promise<IToken & { code: string }>;
  },
  validateAuthToken: async (
    token: string,
    code: string
  ): Promise<IUser | null> => {
    const authToken: any = await TokenModel.findOne({
      token_type: TOKEN_TYPE.validate,
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
