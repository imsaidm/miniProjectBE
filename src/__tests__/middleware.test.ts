import { tokenMiddleware } from '../middleware/token';
import verifyRole from '../middleware/verifyRole';

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Middleware', () => {
  test('tokenMiddleware rejects missing token', () => {
    const req: any = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    tokenMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('verifyRole forbids when role not allowed', () => {
    const req: any = { user: { role: 'CUSTOMER' } };
    const res = mockRes();
    const next = jest.fn();
    verifyRole('ORGANIZER')(req as any, res as any, next as any);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});


