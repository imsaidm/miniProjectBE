import { prisma, withRetry } from '../config/prisma';

export class EventService {
  async createEvent(organizerId: number, data: any) {
    const { title, description, location, category, startAt, endAt, basePriceIDR, totalSeats, availableSeats, bannerImage } = data;
    
    return prisma.$transaction(async (tx) => {
      // Create the event
      const event = await tx.event.create({
        data: {
          organizerId,
          title,
          description,
          location,
          category,
          startAt: new Date(startAt),
          endAt: new Date(endAt),
          basePriceIDR: basePriceIDR !== undefined && basePriceIDR !== null ? Number(basePriceIDR) : null,
          totalSeats: totalSeats !== undefined && totalSeats !== null ? Number(totalSeats) : null,
          availableSeats: availableSeats !== undefined && availableSeats !== null ? Number(availableSeats) : null,
          bannerImage
        }
      });
      
      // Create a default ticket type if basePriceIDR and totalSeats are provided
      if (basePriceIDR !== undefined && basePriceIDR !== null && totalSeats !== undefined && totalSeats !== null && Number(totalSeats) > 0) {
        await tx.ticketType.create({
          data: {
            eventId: event.id,
            name: "General Admission",
            priceIDR: Number(basePriceIDR),
            totalSeats: Number(totalSeats),
            availableSeats: Number(availableSeats || totalSeats)
          }
        });
      }
      
      return event;
    });
  }
  async updateEvent(eventId: number, organizerId: number, data: any) {
    // Verify the event belongs to the organizer
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!existingEvent) {
      throw { status: 404, message: 'Event not found' };
    }
    
    if (existingEvent.organizerId !== organizerId) {
      throw { status: 403, message: 'You can only edit your own events' };
    }
    
    // Debug: log incoming keys to spot wrong field names from client
    try { console.log('[updateEvent] incoming keys:', Object.keys(data || {})); } catch {}

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.startAt) updateData.startAt = new Date(data.startAt);
    if (data.endAt) updateData.endAt = new Date(data.endAt);
    if (data.basePriceIDR !== undefined && data.basePriceIDR !== null && data.basePriceIDR !== '') {
      const n = Number(data.basePriceIDR);
      if (Number.isFinite(n)) updateData.basePriceIDR = n;
    }
    if (data.totalSeats !== undefined && data.totalSeats !== null && data.totalSeats !== '') {
      const n = Number(data.totalSeats);
      if (Number.isFinite(n)) updateData.totalSeats = n;
    }
    if (data.availableSeats !== undefined && data.availableSeats !== null && data.availableSeats !== '') {
      const n = Number(data.availableSeats);
      if (Number.isFinite(n)) updateData.availableSeats = n;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.bannerImage !== undefined) updateData.bannerImage = data.bannerImage;

    try {
      return await prisma.event.update({
        where: { id: eventId },
        data: updateData,
      });
    } catch (e: any) {
      console.error('[updateEvent] prisma.event.update error:', e?.message || e);
      throw e;
    }
  }
  async deleteEvent(eventId: number, organizerId: number) {
    return prisma.event.delete({ where: { id: eventId, organizerId } });
  }
  async listEvents(params: any) {
    const { category, q, location, status, startAt, endAt } = params;
    const where: any = {
      ...(category && { category }),
      ...(status && { status }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(q && { OR: [ { title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } } ] }),
      ...(startAt && { startAt: { gte: new Date(startAt) } }),
      ...(endAt && { endAt: { lte: new Date(endAt) } })
    };
    
    const events = await prisma.event.findMany({ 
      where, 
      include: { organizer: { select: { id: true, name: true, profileImg: true } } },
      orderBy: { startAt: 'asc' } 
    });

    // Calculate organizer ratings for each event
    const eventsWithRatings = await Promise.all(
      events.map(async (event) => {
        const organizerReviews = await withRetry(() => 
          prisma.review.findMany({
            where: { event: { organizerId: event.organizerId } },
            select: { rating: true }
          })
        );

        const organizerRating = organizerReviews.length > 0 
          ? organizerReviews.reduce((sum, review) => sum + review.rating, 0) / organizerReviews.length 
          : 0;

        return {
          ...event,
          organizer: {
            ...event.organizer,
            rating: organizerRating,
            reviewCount: organizerReviews.length
          }
        };
      })
    );

    return eventsWithRatings;
  }
  
  async getOrganizerEvents(organizerId: number) {
    return prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' }
    });
  }
  async getEventDetails(eventId: number) {
    if (!eventId || isNaN(eventId) || eventId <= 0) {
      throw { status: 400, message: 'Invalid event ID' };
    }
    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { 
        organizer: { select: { id: true, name: true, profileImg: true } }, 
        ticketTypes: true, 
        vouchers: true, 
        reviews: true 
      }
    });

    if (!event) {
      throw { status: 404, message: 'Event not found' };
    }

    // Calculate organizer rating
    const organizerReviews = await withRetry(() => 
      prisma.review.findMany({
        where: { event: { organizerId: event.organizerId } },
        select: { rating: true }
      })
    );

    const organizerRating = organizerReviews.length > 0 
      ? organizerReviews.reduce((sum, review) => sum + review.rating, 0) / organizerReviews.length 
      : 0;

    return {
      ...event,
      organizer: {
        ...event.organizer,
        rating: organizerRating,
        reviewCount: organizerReviews.length
      }
    };
  }
  async createTicketType(eventId: number, data: any) {
    return prisma.ticketType.create({ data: { ...data, eventId } });
  }
  async updateTicketType(ticketTypeId: number, organizerId: number, data: any) {
    const ticket = await prisma.ticketType.findUnique({ where: { id: ticketTypeId }, include: { event: true } });
    if (!ticket || ticket.event.organizerId !== organizerId) throw { status: 403, message: 'Forbidden' };
    return prisma.ticketType.update({ where: { id: ticketTypeId }, data });
  }
  async deleteTicketType(ticketTypeId: number, organizerId: number) {
    const ticket = await prisma.ticketType.findUnique({ where: { id: ticketTypeId }, include: { event: true } });
    if (!ticket || ticket.event.organizerId !== organizerId) throw { status: 403, message: 'Forbidden' };
    return prisma.ticketType.delete({ where: { id: ticketTypeId } });
  }
}

export default new EventService();
