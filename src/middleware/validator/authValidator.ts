import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

type RegisterBody = {
  email: string;
  password: string;
  name?: string;
  referralCode?: string;
};

const registerSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  name: yup.string(),
  referralCode: yup.string(),
});

export async function registerValidation(req: Request, res: Response, next: NextFunction) {
  try {
    await registerSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (err: any) {
    res.status(400).json({ errors: err.errors || 'Invalid payload' });
  }
}

