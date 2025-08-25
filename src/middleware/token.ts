import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
export const Token = (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = req.headers.authorization?.split(" ")[1];
    if (!tokens) {
      throw { code: 401, message: "Unauthorized Token" };
    }
    const checkToken = verify(tokens, "secret");

    res.locals.decrypt = checkToken;
    next();
  } catch (error) {
    next(error);
  }
};
