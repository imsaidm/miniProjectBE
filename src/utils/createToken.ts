import { sign } from "jsonwebtoken";
import { verify } from "jsonwebtoken";

export const createToken = (account: any, expiresIn: any) => {
  return sign(
    {
      id: account.id,
      role: account.role,
    },
    "secret",
    {
      // "secret" is the password for token
      expiresIn,
    }
  );
};

export const verifyToken = (token: string) => {
  try {
    return verify(token, "secret");
  } catch (error) {
    return null;
  }
};
