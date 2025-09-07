"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const prisma_1 = require("../../config/prisma");
class TicketService {
    async checkSeatAvailability(items) {
        const ticketTypeIds = items.map((item) => item.ticketTypeId);
        const tickets = await prisma_1.prisma.ticketType.findMany({
            where: { id: { in: ticketTypeIds } }
        });
        const ticketMap = new Map(tickets.map((t) => [t.id, t]));
        for (const item of items) {
            const ticket = ticketMap.get(item.ticketTypeId);
            if (!ticket) {
                throw new Error(`Ticket type ${item.ticketTypeId} not found`);
            }
            const typedTicket = ticket;
            if (!typedTicket.availableSeats || typedTicket.availableSeats < item.quantity) {
                throw new Error(`Insufficient seats for ticketTypeId ${item.ticketTypeId}`);
            }
        }
        return true;
    }
    async validateAndReserveTickets(items, tx) {
        const ticketTypeIds = items.map((item) => item.ticketTypeId);
        const tickets = await tx.ticketType.findMany({
            where: { id: { in: ticketTypeIds } }
        });
        let subtotal = 0;
        const ticketMap = new Map(tickets.map((t) => [t.id, t]));
        for (const item of items) {
            const ticket = ticketMap.get(item.ticketTypeId);
            if (!ticket) {
                throw new Error(`Ticket type ${item.ticketTypeId} not found`);
            }
            // Type assertion since we know ticket exists at this point
            const typedTicket = ticket;
            if (!typedTicket.availableSeats || typedTicket.availableSeats < item.quantity) {
                throw new Error(`Insufficient seats for ticketTypeId ${item.ticketTypeId}`);
            }
            subtotal += typedTicket.priceIDR * item.quantity;
            item.__unitPriceIDR = typedTicket.priceIDR;
        }
        // Reserve tickets with additional safety check
        const updatePromises = items.map((item) => tx.ticketType.updateMany({
            where: {
                id: item.ticketTypeId,
                availableSeats: { gte: item.quantity } // Ensure we have enough seats
            },
            data: { availableSeats: { decrement: item.quantity } }
        }));
        const results = await Promise.all(updatePromises);
        // Check if all updates were successful
        for (let i = 0; i < results.length; i++) {
            if (results[i].count === 0) {
                throw new Error(`Failed to reserve seats for ticketTypeId ${items[i].ticketTypeId}. Seats may have been taken by another user.`);
            }
        }
        return { subtotal, items };
    }
    async releaseTickets(items, tx) {
        const updatePromises = items.map((item) => tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: { availableSeats: { increment: item.quantity } }
        }));
        await Promise.all(updatePromises);
    }
    async createAttendanceRecords(transaction, tx) {
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
            }
            catch (error) {
                console.error('Error creating/updating attendance record:', error);
            }
        }
    }
}
exports.TicketService = TicketService;
exports.default = new TicketService();
//# sourceMappingURL=ticket.service.js.map