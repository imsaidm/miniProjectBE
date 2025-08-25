import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { createToken, verifyToken } from "../utils/createToken";
import { cloudinaryUpload } from "../config/cloudinary";
import { registerService, loginService } from "../service/auth.service";
import logger from "../utils/logger";

const prisma = new PrismaClient();

class AuthController {
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      await registerService(req.body);
      return res.status(201).json({
        message:
          "User registered successfully. Please check your email to verify account.",
      });
    } catch (error) {
      next(error);
    }
  }

  public async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Token is required" });
      }

      const decoded: any = verifyToken(token);
      if (!decoded || !decoded.id) {
        return res
          .status(400)
          .json({ message: "Verification failed. Token invalid or expired." });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(200).json({ message: "User already verified" });
      }

      await prisma.user.update({
        where: { id: decoded.id },
        data: { isVerified: true },
      });

      return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      logger.info(`${req.method} ${req.path}: incoming data ${JSON.stringify(req.body)}`)
      if (typeof email !== "string" || typeof password !== "string") {
        return res
          .status(400)
          .json({ error: "Email and password must be strings" });
      }

      const { token, user } = await loginService(email, password);

      return res.status(200).json({
        message: "User signed in successfully",
        token,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async keepLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const signInUser = await prisma.user.findUnique({
        where: { id: parseInt(res.locals.decrypt.id) },
      });

      if (!signInUser) {
        return res.status(404).send({
          success: false,
          message: "Account not found",
        });
      }

      const newToken = createToken(signInUser, "24h");

      res.status(200).send({
        success: true,
        message: "Sign In successful",
        user: { email: signInUser.email, token: newToken },
      });
    } catch (error) {
      next(error);
    }
  }

  public async changeProfileImg(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.file) {
        throw { code: 404, message: "No Exist file" };
      }
      const upload = await cloudinaryUpload(req.file);
      const update = await prisma.user.update({
        where: { id: parseInt(res.locals.decrypt.id) },
        data: { profile_img: upload.secure_url },
      });

      res
        .status(200)
        .send({ success: true, message: "Change Image profile success" });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
