import { Request, Response, NextFunction } from 'express';
import DashboardService from '../service/dashboard.service';

export class DashboardController {
  /**
   * Get dashboard summary for organizer
   */
  async getDashboardSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user?.id;
      
      // Validate user authentication
      if (!organizerId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Validate organizer ID
      if (typeof organizerId !== 'number' || organizerId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid organizer ID'
        });
      }

      const result = await DashboardService.getDashboardSummary(organizerId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Dashboard summary retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      next(error);
    }
  }

  /**
   * Get dashboard report with filters
   */
  async getDashboardReport(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user?.id;
      
      // Validate user authentication
      if (!organizerId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Validate organizer ID
      if (typeof organizerId !== 'number' || organizerId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid organizer ID'
        });
      }

      // Extract and validate query parameters
      const { year, month, day } = req.query;
      const period: any = {};
      
      if (year) {
        const yearNum = parseInt(year as string);
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
          return res.status(400).json({
            success: false,
            message: 'Invalid year parameter'
          });
        }
        period.year = yearNum;
      }
      
      if (month) {
        const monthNum = parseInt(month as string);
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
          return res.status(400).json({
            success: false,
            message: 'Invalid month parameter'
          });
        }
        period.month = monthNum;
      }
      
      if (day) {
        const dayNum = parseInt(day as string);
        if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
          return res.status(400).json({
            success: false,
            message: 'Invalid day parameter'
          });
        }
        period.day = dayNum;
      }

      const result = await DashboardService.getDashboardReport(organizerId, period);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Dashboard report retrieved successfully',
        filters: period
      });
    } catch (error) {
      console.error('Error in getDashboardReport:', error);
      next(error);
    }
  }

  /**
   * Get event attendees
   */
  async getEventAttendees(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user?.id;
      
      // Validate user authentication
      if (!organizerId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Extract and validate event ID
      const eventId = parseInt(req.params.eventId || '0');
      if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID'
        });
      }

      // TODO: Add authorization check to ensure user owns this event
      // This would require an additional service method to verify event ownership

      const result = await DashboardService.getEventAttendees(eventId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Event attendees retrieved successfully',
        count: result.length
      });
    } catch (error) {
      console.error('Error in getEventAttendees:', error);
      next(error);
    }
  }

  /**
   * Get event transactions
   */
  async getEventTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user?.id;
      
      // Validate user authentication
      if (!organizerId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Extract and validate event ID
      const eventId = parseInt(req.params.eventId || '0');
      if (isNaN(eventId) || eventId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event ID'
        });
      }

      // TODO: Add authorization check to ensure user owns this event
      // This would require an additional service method to verify event ownership

      const result = await DashboardService.getEventTransactions(eventId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Event transactions retrieved successfully',
        count: result.length
      });
    } catch (error) {
      console.error('Error in getEventTransactions:', error);
      next(error);
    }
  }

  /**
   * Get analytics data for organizer
   */
  async getAnalyticsData(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user?.id;
      
      // Validate user authentication
      if (!organizerId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Validate organizer ID
      if (typeof organizerId !== 'number' || organizerId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid organizer ID'
        });
      }

      const result = await DashboardService.getAnalyticsData(organizerId);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Analytics data retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getAnalyticsData:', error);
      next(error);
    }
  }

  /**
   * Get dashboard overview (summary + analytics)
   */
  async getDashboardOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const organizerId = (req as any).user?.id;
      
      // Validate user authentication
      if (!organizerId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Validate organizer ID
      if (typeof organizerId !== 'number' || organizerId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid organizer ID'
        });
      }

      // Get both summary and analytics data in parallel
      const [summary, analytics] = await Promise.all([
        DashboardService.getDashboardSummary(organizerId),
        DashboardService.getAnalyticsData(organizerId)
      ]);
      
      res.status(200).json({
        success: true,
        data: {
          summary,
          analytics
        },
        message: 'Dashboard overview retrieved successfully'
      });
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      next(error);
    }
  }
}

export default new DashboardController();
