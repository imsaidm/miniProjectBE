import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const validationHandle = (req: Request, res: Response, next: NextFunction) => {
  try {
    const errorValidation = validationResult(req);
    if (!errorValidation.isEmpty()) {
      throw errorValidation.array();
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const registerValidation = [
  body("email").notEmpty().isEmail().withMessage("Email is Required"),
  body("password").notEmpty().isStrongPassword({
    minLength: 4,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  }),
  body("name").notEmpty().withMessage("Name is required"),
  validationHandle,
];

export const loginValidation = [
  body("email").notEmpty().isEmail().withMessage("Email is required"),
  body("password").notEmpty().withMessage("password is required"),
  validationHandle,
];
