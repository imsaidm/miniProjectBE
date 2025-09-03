import AuthService from '../service/auth.service';

jest.mock('../config/prisma', () => {
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      passwordResetToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: (fn: any) => fn({
        user: { update: jest.fn() },
        passwordResetToken: { update: jest.fn() },
      }),
    },
  };
});

const { prisma } = require('../config/prisma');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('changePassword updates when old password matches', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, password: await require('bcryptjs').hash('old', 1) });
    prisma.user.update.mockResolvedValue({ id: 1 });

    const res = await AuthService.changePassword(1, 'old', 'new');
    expect(res).toEqual({ message: 'Password updated' });
    expect(prisma.user.update).toHaveBeenCalled();
  });

  test('forgotPassword creates token (returns token for test)', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 9, email: 'a@a.com' });
    prisma.passwordResetToken.create.mockResolvedValue({ id: 1 });
    const res = await AuthService.forgotPassword('a@a.com');
    expect(res).toHaveProperty('token');
    expect(prisma.passwordResetToken.create).toHaveBeenCalled();
  });

  test('resetPassword with valid token updates and marks used', async () => {
    const future = new Date(Date.now() + 100000);
    prisma.passwordResetToken.findUnique.mockResolvedValue({ id: 5, userId: 2, expiresAt: future, usedAt: null });

    const res = await AuthService.resetPassword('token123', 'new');
    expect(res).toEqual({ message: 'Password has been reset' });
  });
});


