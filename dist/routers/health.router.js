"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const transaction_service_1 = __importDefault(require("../service/transaction.service"));
const router = (0, express_1.Router)();
// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const isDbConnected = await (0, prisma_1.checkConnection)();
        if (isDbConnected) {
            res.status(200).json({
                status: 'healthy',
                database: 'connected',
                timestamp: new Date().toISOString()
            });
        }
        else {
            res.status(503).json({
                status: 'unhealthy',
                database: 'disconnected',
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (error) {
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
        const result = await transaction_service_1.default.expireOverdueTransactions();
        res.status(200).json({
            message: 'Transaction expiration triggered',
            expiredCount: result.expiredCount,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('[MANUAL] Error expiring transactions:', error);
        res.status(500).json({
            error: 'Failed to expire transactions',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.router.js.map