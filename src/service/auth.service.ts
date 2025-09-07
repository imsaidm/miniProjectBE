import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '../config/mailer';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme!';
const POINTS_REFERRAL_REWARD = 10000;
const COUPON_VALUE = 10000;
const COUPON_EXP_DAYS = 90;

interface RegisterDTO {
  email: string;
  password: string;
  name?: string;
  role?: 'CUSTOMER' | 'ORGANIZER';
  referralCode?: string;
}

export class AuthService {
  async register({ email, password, name, role, referralCode }: RegisterDTO) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw { status: 409, message: 'Email is already registered' };

    const hashedPass = await bcrypt.hash(password, 10);

    const userReferralCode = (uuidv4().split('-')[0] || '').toUpperCase();

    const userPayload: any = {
      email,
      password: hashedPass,
      name,
      role: role || 'CUSTOMER',
      referralCode: userReferralCode,
    };
    if (referralCode) userPayload.referredByCode = referralCode;

    const user = await prisma.user.create({ data: userPayload });

    const emailToken = uuidv4();
    const emailTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token: emailToken, expiresAt: emailTokenExpiresAt }
    });

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'https://mini-project-fe-gamma.vercel.app';
    const verifyUrl = `${frontendBaseUrl}/auth/verify?token=${encodeURIComponent(emailToken)}`;
    const subject = 'Verify your email address';
    const html = `
      <p>Hi${name ? ' ' + name : ''},</p>
      <p>Thanks for registering. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>If you did not sign up, you can ignore this email.</p>
    `;
    await sendEmail({ to: email, subject, html, text: `Verify your email: ${verifyUrl}` });
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } });
      if (referrer) {
        const expiresAt = new Date(Date.now() + COUPON_EXP_DAYS * 24 * 60 * 60 * 1000);

        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: user.id,
          },
        });

        await prisma.pointEntry.create({
          data: {
            userId: referrer.id,
            delta: POINTS_REFERRAL_REWARD,
            source: 'REFERRAL_REWARD',
            expiresAt,
          },
        });
        await prisma.user.update({
          where: { id: referrer.id },
          data: { 
            pointsBalance: {
              increment: POINTS_REFERRAL_REWARD
            }
          }
        });

        await prisma.coupon.create({
          data: {
            code: uuidv4(),
            userId: user.id,
            discountType: 'AMOUNT',
            discountValue: COUPON_VALUE,
            expiresAt,
          },
        });
      }
    }

    const resp: any = { 
      userId: user.id, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      role: user.role, 
      message: 'Registration successful' 
    };
    if (process.env.NODE_ENV !== 'production') {
      resp.verifyToken = emailToken;
      resp.verifyUrl = verifyUrl;
    }
    return resp;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw { status: 401, message: 'Invalid email/password' };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw { status: 401, message: 'Invalid email/password' };

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  }

  async changePassword(userId: number, oldPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { status: 404, message: 'User not found' };
    const valid = await bcrypt.compare(oldPass, user.password);
    if (!valid) throw { status: 400, message: 'Old password incorrect' };
    const hashed = await bcrypt.hash(newPass, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { message: 'Password updated' };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If the email exists, a reset link will be sent' };
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });
    return { message: 'Reset token created', token };
  }

  async resetPassword(token: string, newPass: string) {
    const prt = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!prt || prt.usedAt || prt.expiresAt < new Date()) throw { status: 400, message: 'Invalid or expired token' };
    const hashed = await bcrypt.hash(newPass, 10);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: prt.userId }, data: { password: hashed } });
      await tx.passwordResetToken.update({ where: { id: prt.id }, data: { usedAt: new Date() } });
    });
    return { message: 'Password has been reset' };
  }

  async updateProfile(userId: number, data: any) {
    const { name } = data;
    const user = await prisma.user.update({ where: { id: userId }, data: { name } });
    return { id: user.id, email: user.email, name: user.name, profileImg: user.profileImg, role: user.role };
  }

  async uploadProfileImage(userId: number, image: any) {
    const imageUrl = typeof image === 'string' ? image : image?.secure_url;
    if (!imageUrl) throw { status: 400, message: 'Image is required' };
    const user = await prisma.user.update({ where: { id: userId }, data: { profileImg: imageUrl } });
    return { id: user.id, profileImg: user.profileImg };
  }
}

export default new AuthService();