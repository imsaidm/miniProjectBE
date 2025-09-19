import { Router } from 'express';
import { checkConnection } from '../config/prisma';
import transactionService from '../service/transaction.service';

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

// Manual transaction expiration endpoint for testing
router.post('/expire-transactions', async (req, res) => {
  try {
    console.log('[MANUAL] Triggering transaction expiration...');
    const result = await transactionService.expireOverdueTransactions();
    res.status(200).json({
      message: 'Transaction expiration triggered',
      expiredCount: result.expiredCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[MANUAL] Error expiring transactions:', error);
    res.status(500).json({
      error: 'Failed to expire transactions',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
