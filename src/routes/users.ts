import { Router, Request, Response, RequestHandler, Handler } from "express";
import Joi, { any } from "joi";
import usersService from "src/services/users.service";
import tokensService from "src/services/tokens.service";
import {
  isUserLoggedIn,
  RequestLoggedIn,
} from "src/middleware/auth.middleware";
import emailService from "src/services/email.service";

var router = Router();

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  role: Joi.string().valid("client", "admin").default("client"),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

router.post("/register", async (req: Request, res: Response) => {
  const { value, error } = registerSchema.validate(req.body);
  if (error) return res.send(error.details).status(400);
  try {
    let user = await usersService.createUser(value);
    let refreshToken = await tokensService.createRefreshToken(String(user._id));
    res.status(200).json({ refreshToken });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------

const LoginSchema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});
router.post("/login", async (req: Request, res: Response) => {
  const { value, error } = LoginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details });
  try {
    let user = await usersService.getUserByEmail(value.email);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User with that email not found" });
    }
    let isPasswordMatching = await usersService.checkUserPassword(
      user,
      value.password
    );
    if (!isPasswordMatching) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const twoFaToken = await tokensService.create2faToken(String(user._id));
    const emailVerif = await emailService.send2FaEmail(
      value.email,
      twoFaToken.code
    );
    res.status(200).json({ twoFaToken: twoFaToken.token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------

const twoFaSchema = Joi.object({
  code: Joi.string().required(),
  token: Joi.string().required(),
});

router.post("/2fa", async (req, res) => {
  const { value, error } = twoFaSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details });
  try {
    const user = await tokensService.validate2faToken(value.token, value.code);

    if (!user) return res.status(400).json({ message: "Invalid 2fa" });

    const refreshToken = await tokensService.createRefreshToken(
      String(user._id)
    );
    res.status(200).json({ refreshToken: refreshToken.token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------

router.post(
  "/say-hi",
  isUserLoggedIn,
  async (req: RequestLoggedIn, res: Response) => {
    console.log(req.user);

    res.status(200).json({ message: "hi" });
  }
);

export default router;
