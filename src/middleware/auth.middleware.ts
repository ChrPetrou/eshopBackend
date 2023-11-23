import { IUser } from "@models/userModel";
import { NextFunction, Request, Response } from "express";
import tokensService from "src/services/tokens.service";

export type RequestLoggedIn = Request & { user?: IUser };

export async function isUserLoggedIn(
  req: RequestLoggedIn,
  res: Response,
  next: NextFunction
) {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "invalid autharization header" });
  }

  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "invalid token" });
  }
  const user = await tokensService.validateRefreshToken(token);
  if (!user) {
    return res.status(401).json({ message: "invalid token" });
  }
  req.user = user;
  next();
}
