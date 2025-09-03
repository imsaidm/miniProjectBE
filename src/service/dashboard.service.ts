import { prisma } from '../config/prisma';

// Types for better type safety
interface RevenueData {
  month?: string;
  year?: string;
  date?: string;
  revenue: number;
}

interface DashboardSummaryResult {
  totalEvents: number;
  totalTransactions: number;
  totalRevenue: number;
  monthlyRevenue: RevenueData[];
  yearlyRevenue: RevenueData[];
  dailyRevenue: RevenueData[];
}

interface DashboardReportFilters {
  year?: number;
  month?: number;
  day?: number;
}

export class DashboardService {
  /**
   * Get dashboard summary with optimized database queries
   */
  async getDashboardSummary(organizerId: number): Promise<DashboardSummaryResult> {
    try {
      // Validate input
      if (!organizerId || organizerId <= 0) {
        throw new Error('Invalid organizer ID');
      }

      // Execute all queries in parallel for better performance
      const [eventCount, ticketSales, revenue, monthlyRevenue, yearlyRevenue, dailyRevenue] = await Promise.all([
        this.getEventCount(organizerId),
        this.getTicketSalesCount(organizerId),
        this.getTotalRevenue(organizerId),
        this.getMonthlyRevenue(organizerId),
        this.getYearlyRevenue(organizerId),
        this.getDailyRevenue(organizerId)
      ]);

      return {
        totalEvents: eventCount,
        totalTransactions: ticketSales,
        totalRevenue: revenue,
        monthlyRevenue,
        yearlyRevenue,
        dailyRevenue
      };
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      throw new Error('Failed to fetch dashboard summary');
    }
  }

  /**
   * Get event count for organizer
   */
  private async getEventCount(organizerId: number): Promise<number> {
    try {
      return await prisma.event.count({ 
        where: { organizerId } 
      });
    } catch (error) {
      console.error('Error getting event count:', error);
      return 0;
    }
  }

  /**
   * Get completed ticket sales count
   */
  private async getTicketSalesCount(organizerId: number): Promise<number> {
    try {
      return await prisma.transaction.count({ 
        where: { 
          event: { organizerId }, 
          status: 'DONE' 
        } 
      });
    } catch (error) {
      console.error('Error getting ticket sales count:', error);
      return 0;
    }
  }

  /**
   * Get total revenue for organizer
   */
  private async getTotalRevenue(organizerId: number): Promise<number> {
    try {
      const result = await prisma.transaction.aggregate({
        where: { 
          event: { organizerId }, 
          status: 'DONE' 
        },
        _sum: { totalPayableIDR: true }
      });

      return result._sum.totalPayableIDR ?? 0;
    } catch (error) {
      console.error('Error getting total revenue:', error);
      return 0;
    }
  }

  /**
   * Get monthly revenue for current year with optimized query
   */
  private async getMonthlyRevenue(organizerId: number): Promise<RevenueData[]> {
    try {
      const currentYear = new Date().getFullYear();
      
      const monthlyRevenue = await prisma.$queryRaw<Array<{ month: number; revenue: string }>>`
        SELECT 
          EXTRACT(MONTH FROM "createdAt") as month,
          COALESCE(SUM("totalPayableIDR"), 0) as revenue
        FROM "Transaction" 
        WHERE "eventId" IN (
          SELECT id FROM "Event" WHERE "organizerId" = ${organizerId}
        ) 
        AND status = 'DONE'
        AND EXTRACT(YEAR FROM "createdAt") = ${currentYear}
        GROUP BY EXTRACT(MONTH FROM "createdAt")
        ORDER BY month
      `;

      return monthlyRevenue.map((item) => ({
        month: this.getMonthName(item.month),
        revenue: Number(item.revenue) || 0
      }));
    } catch (error) {
      console.error('Error getting monthly revenue:', error);
      return [];
    }
  }

  /**
   * Get yearly revenue with optimized query
   */
  private async getYearlyRevenue(organizerId: number): Promise<RevenueData[]> {
    try {
      const yearlyRevenue = await prisma.$queryRaw<Array<{ year: number; revenue: string }>>`
        SELECT 
          EXTRACT(YEAR FROM "createdAt") as year,
          COALESCE(SUM("totalPayableIDR"), 0) as revenue
        FROM "Transaction" 
        WHERE "eventId" IN (
          SELECT id FROM "Event" WHERE "organizerId" = ${organizerId}
        ) 
        AND status = 'DONE'
        GROUP BY EXTRACT(YEAR FROM "createdAt")
        ORDER BY year DESC
        LIMIT 5
      `;

      return yearlyRevenue.map((item) => ({
        year: item.year.toString(),
        revenue: Number(item.revenue) || 0
      }));
    } catch (error) {
      console.error('Error getting yearly revenue:', error);
      return [];
    }
  }

  /**
   * Get daily revenue for current month with optimized query
   */
  private async getDailyRevenue(organizerId: number): Promise<RevenueData[]> {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      const dailyRevenue = await prisma.$queryRaw<Array<{ date: number; revenue: string }>>`
        SELECT 
          EXTRACT(DAY FROM "createdAt") as date,
          COALESCE(SUM("totalPayableIDR"), 0) as revenue
        FROM "Transaction" 
        WHERE "eventId" IN (
          SELECT id FROM "Event" WHERE "organizerId" = ${organizerId}
        ) 
        AND status = 'DONE'
        AND EXTRACT(YEAR FROM "createdAt") = ${currentYear}
        AND EXTRACT(MONTH FROM "createdAt") = ${currentMonth}
        GROUP BY EXTRACT(DAY FROM "createdAt")
        ORDER BY date
      `;

      return dailyRevenue.map((item) => ({
        date: item.date.toString(),
        revenue: Number(item.revenue) || 0
      }));
    } catch (error) {
      console.error('Error getting daily revenue:', error);
      return [];
    }
  }

  /**
   * Get month name from month number
   */
  private getMonthName(monthNumber: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  }

  /**
   * Get dashboard report with filters
   */
  async getDashboardReport(organizerId: number, period: DashboardReportFilters) {
    try {
      // Validate input
      if (!organizerId || organizerId <= 0) {
        throw new Error('Invalid organizer ID');
      }

      // Build filters
      const filters: any = { 
        event: { organizerId }, 
        status: 'DONE' 
      };

      // Add date filters if provided
      if (period.year) {
        const startDate = new Date(`${period.year}-01-01`);
        const endDate = new Date(`${period.year}-12-31`);
        filters.createdAt = { gte: startDate, lte: endDate };
      }

      if (period.month && period.year) {
        const firstDay = `${period.year}-${String(period.month).padStart(2, '0')}-01`;
        const lastDay = new Date(period.year, period.month, 0).getDate();
        const lastDayStr = `${period.year}-${String(period.month).padStart(2, '0')}-${lastDay}`;
        
        filters.createdAt = { 
          gte: new Date(firstDay), 
          lte: new Date(lastDayStr) 
        };
      }

      // Execute query with optimized includes
      const transactions = await prisma.transaction.findMany({ 
        where: filters,
        include: { 
          items: {
            select: {
              id: true,
              quantity: true,
              unitPriceIDR: true,
              ticketType: {
                select: {
                  name: true,
                  priceIDR: true
                }
              }
            }
          },
          paymentProof: {
            select: {
              id: true,
              imageUrl: true,
              uploadedAt: true
            }
          },
          event: {
            select: {
              id: true,
              title: true,
              startAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return transactions;
    } catch (error) {
      console.error('Error in getDashboardReport:', error);
      throw new Error('Failed to fetch dashboard report');
    }
  }

  /**
   * Get event attendees with optimized query
   */
  async getEventAttendees(eventId: number) {
    try {
      // Validate input
      if (!eventId || eventId <= 0) {
        throw new Error('Invalid event ID');
      }

      return await prisma.attendance.findMany({
        where: { eventId },
        include: { 
          user: { 
            select: { 
              id: true, 
              name: true, 
              email: true,
              profileImg: true
            } 
          }, 
          ticketType: {
            select: {
              id: true,
              name: true,
              priceIDR: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      console.error('Error in getEventAttendees:', error);
      throw new Error('Failed to fetch event attendees');
    }
  }

  /**
   * Get event transactions with optimized query
   */
  async getEventTransactions(eventId: number) {
    try {
      // Validate input
      if (!eventId || eventId <= 0) {
        throw new Error('Invalid event ID');
      }

      return await prisma.transaction.findMany({ 
        where: { eventId },
        include: { 
          items: {
            select: {
              id: true,
              quantity: true,
              unitPriceIDR: true,
              ticketType: {
                select: {
                  name: true,
                  priceIDR: true
                }
              }
            }
          }, 
          paymentProof: {
            select: {
              id: true,
              imageUrl: true,
              uploadedAt: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      console.error('Error in getEventTransactions:', error);
      throw new Error('Failed to fetch event transactions');
    }
  }

  /**
   * Get additional analytics data
   */
  async getAnalyticsData(organizerId: number) {
    try {
      // Validate input
      if (!organizerId || organizerId <= 0) {
        throw new Error('Invalid organizer ID');
      }

      const [totalRevenue, avgTicketPrice, topEvents] = await Promise.all([
        // Total revenue
        prisma.transaction.aggregate({
          where: { 
            event: { organizerId }, 
            status: 'DONE' 
          },
          _sum: { totalPayableIDR: true }
        }),

        // Average ticket price
        prisma.transaction.aggregate({
          where: { 
            event: { organizerId }, 
            status: 'DONE' 
          },
          _avg: { totalPayableIDR: true }
        }),

        // Top performing events
        prisma.event.findMany({
          where: { organizerId },
          include: {
            _count: {
              select: { transactions: true }
            }
          },
          orderBy: {
            transactions: {
              _count: 'desc'
            }
          },
          take: 5
        })
      ]);

      return {
        totalRevenue: totalRevenue._sum.totalPayableIDR ?? 0,
        averageTicketPrice: avgTicketPrice._avg.totalPayableIDR ?? 0,
        topEvents: topEvents.map(event => ({
          id: event.id,
          title: event.title,
          transactionCount: event._count.transactions
        }))
      };
    } catch (error) {
      console.error('Error in getAnalyticsData:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }
}

export default new DashboardService();
