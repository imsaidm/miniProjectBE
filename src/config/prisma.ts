import { PrismaClient } from '../generated/prisma';

// Configure DATABASE_URL with connection pool parameters
const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

// Add connection pool parameters to DATABASE_URL if not already present
const urlWithPoolConfig = databaseUrl?.includes('?') 
  ? `${databaseUrl}&connection_limit=20&pool_timeout=20&connect_timeout=60`
  : `${databaseUrl}?connection_limit=20&pool_timeout=20&connect_timeout=60`;

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: urlWithPoolConfig,
    },
  },
});

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

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
