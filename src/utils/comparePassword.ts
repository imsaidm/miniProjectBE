import { compare } from "bcryptjs";
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await compare(plainPassword, hashedPassword);
};
