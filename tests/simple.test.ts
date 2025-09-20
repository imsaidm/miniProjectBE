import { prisma } from '../src/config/prisma';

describe('Simple Test Suite', () => {
  it('should connect to database', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  it('should have proper test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
