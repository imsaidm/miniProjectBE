import { prisma } from '../../config/prisma';

export class TicketService {
  async validateAndReserveTickets(items: any[], tx: any) {
    const ticketTypeIds = items.map((item: any) => item.ticketTypeId);
    const tickets = await tx.ticketType.findMany({ 
      where: { id: { in: ticketTypeIds } } 
    });
    
    let subtotal = 0;
    const ticketMap = new Map(tickets.map((t: { id: number; availableSeats: number; priceIDR: number }) => [t.id, t]));
    
    for (const item of items) {
      const ticket = ticketMap.get(item.ticketTypeId);
      if (!ticket) {
        throw new Error(`Ticket type ${item.ticketTypeId} not found`);
      }
      // Type assertion since we know ticket exists at this point
      const typedTicket = ticket as { id: number; availableSeats: number; priceIDR: number };
      if (!typedTicket.availableSeats || typedTicket.availableSeats < item.quantity) {
        throw new Error(`Insufficient seats for ticketTypeId ${item.ticketTypeId}`);
      }
      subtotal += typedTicket.priceIDR * item.quantity;
      item.__unitPriceIDR = typedTicket.priceIDR;
    }
    
    // Reserve tickets
    const updatePromises = items.map((item: any) => 
      tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { availableSeats: { decrement: item.quantity } }
      })
    );
    await Promise.all(updatePromises);
    
    return { subtotal, items };
  }

  async releaseTickets(items: any[], tx: any) {
    const updatePromises = items.map((item: any) => 
      tx.ticketType.update({ 
        where: { id: item.ticketTypeId }, 
        data: { availableSeats: { increment: item.quantity } } 
      })
    );
    await Promise.all(updatePromises);
  }

  async createAttendanceRecords(transaction: any, tx: any) {
    for (const item of transaction.items) {
      try {
        await tx.attendance.upsert({
          where: {
            eventId_userId_ticketTypeId: {
              eventId: transaction.eventId,
              userId: transaction.userId,
              ticketTypeId: item.ticketTypeId
            }
          },
          update: {
            quantity: { increment: item.quantity },
            totalPaidIDR: { increment: (item.unitPriceIDR || 0) * (item.quantity || 0) }
          },
          create: {
            eventId: transaction.eventId,
            userId: transaction.userId,
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            totalPaidIDR: (item.unitPriceIDR || 0) * (item.quantity || 0)
          }
        });
      } catch (error) {
        console.error('Error creating/updating attendance record:', error);
      }
    }
  }
}

export default new TicketService();
