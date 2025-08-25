import { prisma } from "../config/prisma";

export const createAccount = async (data: any) => {
  return await prisma.user.create({
    data,
  });
};

export const findByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};
