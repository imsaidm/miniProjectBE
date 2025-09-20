import { prisma } from '../src/config/prisma';

describe('Basic Application Tests', () => {
  it('should connect to database successfully', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  it('should have proper test environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should be able to use Jest matchers', () => {
    expect(1 + 1).toBe(2);
    expect('hello').toContain('hello');
    expect([1, 2, 3]).toHaveLength(3);
    expect({ name: 'test' }).toHaveProperty('name');
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('test');
    await expect(promise).resolves.toBe('test');
  });

  it('should handle errors properly', async () => {
    const promise = Promise.reject(new Error('test error'));
    await expect(promise).rejects.toThrow('test error');
  });
});
