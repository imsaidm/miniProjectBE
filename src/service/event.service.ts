import { prisma, withRetry } from '../config/prisma';

export class EventService {
  async createEvent(organizerId: number, data: any) {
    const { title, description, location, category, startAt, endAt, basePriceIDR, totalSeats, availableSeats, bannerImage, ticketTypes } = data;
    
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
      
      // Create ticket types if provided
      if (ticketTypes && Array.isArray(ticketTypes) && ticketTypes.length > 0) {
        for (const ticketType of ticketTypes) {
          if (ticketType.name && ticketType.name.trim()) {
            await tx.ticketType.create({
              data: {
                eventId: event.id,
                name: ticketType.name.trim(),
                priceIDR: ticketType.priceIDR ? Number(ticketType.priceIDR) : 0,
                totalSeats: ticketType.seats ? Number(ticketType.seats) : 0,
                availableSeats: ticketType.seats ? Number(ticketType.seats) : 0
              }
            });
          }
        }
      } else if (basePriceIDR !== undefined && basePriceIDR !== null && totalSeats !== undefined && totalSeats !== null && Number(totalSeats) > 0) {
        // Fallback to creating a default ticket type if no ticket types provided
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
    
    // Check if event is published - only draft events can be edited by organizers
    if (existingEvent.status === 'PUBLISHED') {
      throw { status: 403, message: 'Published events cannot be edited. Only draft events can be modified.' };
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
    // Verify the event belongs to the organizer and check status
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!existingEvent) {
      throw { status: 404, message: 'Event not found' };
    }
    
    if (existingEvent.organizerId !== organizerId) {
      throw { status: 403, message: 'You can only delete your own events' };
    }
    
    // Check if event is published - only draft events can be deleted by organizers
    if (existingEvent.status === 'PUBLISHED') {
      throw { status: 403, message: 'Published events cannot be deleted. Only draft events can be removed.' };
    }
    
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
    
    // Get events with organizer info
    const events = await prisma.event.findMany({ 
      where, 
      include: { 
        organizer: { 
          select: { 
            id: true, 
            name: true, 
            profileImg: true
          } 
        }
      },
      orderBy: { startAt: 'asc' } 
    });

    // Get organizer ratings separately for better performance
    const organizerIds = [...new Set(events.map(event => event.organizerId))];
    const organizerReviews = await prisma.review.findMany({
      where: {
        event: {
          organizerId: { in: organizerIds }
        }
      },
      select: {
        rating: true,
        event: {
          select: {
            organizerId: true
          }
        }
      }
    });

    // Calculate ratings by organizer
    const organizerStats = new Map<number, { rating: number, reviewCount: number }>();
    organizerReviews.forEach(review => {
      const organizerId = review.event.organizerId;
      if (!organizerStats.has(organizerId)) {
        organizerStats.set(organizerId, { rating: 0, reviewCount: 0 });
      }
      const stats = organizerStats.get(organizerId)!;
      stats.rating += review.rating;
      stats.reviewCount += 1;
    });

    // Calculate average ratings
    organizerStats.forEach((stats, organizerId) => {
      stats.rating = stats.reviewCount > 0 ? stats.rating / stats.reviewCount : 0;
    });

    // Apply ratings to events
    return events.map(event => {
      const stats = organizerStats.get(event.organizerId) || { rating: 0, reviewCount: 0 };
      return {
        ...event,
        organizer: {
          ...event.organizer,
          rating: stats.rating,
          reviewCount: stats.reviewCount
        }
      };
    });
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
    
    // Check if event is published - only draft events can have ticket types modified
    if (ticket.event.status === 'PUBLISHED') {
      throw { status: 403, message: 'Published events cannot have ticket types modified. Only draft events can be edited.' };
    }
    
    return prisma.ticketType.update({ where: { id: ticketTypeId }, data });
  }
  async deleteTicketType(ticketTypeId: number, organizerId: number) {
    const ticket = await prisma.ticketType.findUnique({ where: { id: ticketTypeId }, include: { event: true } });
    if (!ticket || ticket.event.organizerId !== organizerId) throw { status: 403, message: 'Forbidden' };
    
    // Check if event is published - only draft events can have ticket types deleted
    if (ticket.event.status === 'PUBLISHED') {
      throw { status: 403, message: 'Published events cannot have ticket types deleted. Only draft events can be modified.' };
    }
    
    return prisma.ticketType.delete({ where: { id: ticketTypeId } });
  }
  
  async createTicketTypeForEvent(eventId: number, organizerId: number, data: any) {
    // Verify the event belongs to the organizer and check status
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!event) {
      throw { status: 404, message: 'Event not found' };
    }
    
    if (event.organizerId !== organizerId) {
      throw { status: 403, message: 'You can only add ticket types to your own events' };
    }
    
    // Check if event is published - only draft events can have ticket types added
    if (event.status === 'PUBLISHED') {
      throw { status: 403, message: 'Published events cannot have ticket types added. Only draft events can be modified.' };
    }
    
    return prisma.ticketType.create({ data: { ...data, eventId } });
  }
}

export default new EventService();
