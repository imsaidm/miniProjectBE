"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkConnection = exports.withRetry = exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
// Configure DATABASE_URL with optimized connection pool parameters
const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;
// Add optimized connection pool parameters to DATABASE_URL
const urlWithPoolConfig = databaseUrl?.includes('?')
    ? `${databaseUrl}&connection_limit=10&pool_timeout=30&connect_timeout=60&socket_timeout=30&statement_timeout=30000`
    : `${databaseUrl}?connection_limit=10&pool_timeout=30&connect_timeout=60&socket_timeout=30&statement_timeout=30000`;
// Create a singleton Prisma client instance
let prismaInstance = null;
exports.prisma = (() => {
    if (!prismaInstance) {
        prismaInstance = new prisma_1.PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
            datasources: {
                db: {
                    url: urlWithPoolConfig,
                },
            },
        });
    }
    return prismaInstance;
})();
// Connection retry wrapper
const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            // Check if it's a connection pool timeout error
            if (error.code === 'P2024' || error.message?.includes('connection pool')) {
                console.warn(`Connection pool timeout (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay * attempt));
                    continue;
                }
            }
            // For other errors, don't retry
            throw error;
        }
    }
    throw lastError;
};
exports.withRetry = withRetry;
// Connection health check
const checkConnection = async () => {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error('Database connection check failed:', error);
        return false;
    }
};
exports.checkConnection = checkConnection;
// Graceful shutdown with proper cleanup
const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    try {
        // Wait for ongoing operations to complete
        await exports.prisma.$disconnect();
        console.log('Database connection closed successfully');
    }
    catch (error) {
        console.error('Error during shutdown:', error);
    }
    finally {
        process.exit(0);
    }
};
// Handle graceful shutdown
process.on('beforeExit', async () => {
    await gracefulShutdown('beforeExit');
});
process.on('SIGINT', () => {
    gracefulShutdown('SIGINT');
});
process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM');
});
// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    await gracefulShutdown('unhandledRejection');
});
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map