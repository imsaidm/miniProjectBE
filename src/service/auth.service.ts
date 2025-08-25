import { transport } from "../config/nodemailer";
import bcrypt from "bcrypt";
import { createToken } from "../utils/createToken";
import {
  createAccount,
  findByEmail,
} from "../repositories/accounts.repository";

export const registerService = async (data: {
  email: string;
  password: string;
  name: string;
}) => {
  const { email, password, name } = data;

  // cek user existing
  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // simpan user baru
  const user = await createAccount({
    email,
    password: hashedPassword,
    name,
    isVerified: false,
  });

  // generate token
  const token = createToken({ id: user.id }, "1h");

  // link ke FE
  const link = `http://localhost:3000/verify?token=${token}`;

  // kirim email
  await transport.sendMail({
    to: email,
    subject: "Verify your account",
    html: `<a href="${link}" target="_blank"><div>Click here to verify</div></a>`,
  });

  return user;
};

export const loginService = async (email: string, password: string) => {
  // cari user
  const user = await findByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // cek password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // bikin token (24 jam)
  const token = createToken({ id: user.id }, "24h");

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};
