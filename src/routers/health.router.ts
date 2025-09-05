import { Router } from 'express';
import { checkConnection } from '../config/prisma';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const isDbConnected = await checkConnection();
    
    if (isDbConnected) {
      res.status(200).json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
