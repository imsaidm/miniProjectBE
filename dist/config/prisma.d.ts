import { PrismaClient } from '../generated/prisma';
export declare const prisma: PrismaClient<import("../generated/prisma").Prisma.PrismaClientOptions, never, import("../generated/prisma/runtime/library").DefaultArgs>;
export declare const withRetry: <T>(operation: () => Promise<T>, maxRetries?: number, delay?: number) => Promise<T>;
export declare const checkConnection: () => Promise<boolean>;
export default prisma;
//# sourceMappingURL=prisma.d.ts.map