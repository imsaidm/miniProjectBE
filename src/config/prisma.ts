import { PrismaClient } from '../generated/prisma';

// Configure DATABASE_URL with optimized connection pool parameters
const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

// Add optimized connection pool parameters to DATABASE_URL
const urlWithPoolConfig = databaseUrl?.includes('?') 
  ? `${databaseUrl}&connection_limit=10&pool_timeout=30&connect_timeout=60&socket_timeout=30&statement_timeout=30000`
  : `${databaseUrl}?connection_limit=10&pool_timeout=30&connect_timeout=60&socket_timeout=30&statement_timeout=30000`;

// Create a singleton Prisma client instance
let prismaInstance: PrismaClient | null = null;

export const prisma = (() => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
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
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
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
  
  throw lastError!;
};

// Connection health check
export const checkConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};

// Graceful shutdown with proper cleanup
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  
  try {
    // Wait for ongoing operations to complete
    await prisma.$disconnect();
    console.log('Database connection closed successfully');
  } catch (error) {
    console.error('Error during shutdown:', error);
  } finally {
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

export default prisma;
