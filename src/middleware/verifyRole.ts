import { NextFunction, Response, Request } from "express";

export const verifyAuthor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = res.locals.decrypt.role?.toLowerCase();
    if (userRole !== "author" && userRole !== "admin") {
      throw { code: 401, message: "You are not authorized to write blogs" };
    }
    next();
  } catch (error) {
    next(error);
  }
};
