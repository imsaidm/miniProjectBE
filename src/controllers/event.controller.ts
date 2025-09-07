import { Request, Response, NextFunction } from 'express';
import EventService from '../service/event.service';
import { uploadImageBuffer } from '../config/cloudinary';


export class EventController {
    async createEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const body: any = req.body || {};
            const file = (req as any).file as Express.Multer.File | undefined;
            if (file && file.buffer) {
                const imageUrl = await uploadImageBuffer(file.buffer, 'event-banners');
                body.bannerImage = imageUrl;
            }
            
            // Parse ticket types if provided as JSON string
            if (body.ticketTypes && typeof body.ticketTypes === 'string') {
                try {
                    body.ticketTypes = JSON.parse(body.ticketTypes);
                } catch (e) {
                    console.error('Error parsing ticket types:', e);
                    body.ticketTypes = [];
                }
            }
            
            const event = await EventService.createEvent(organizerId, body);
            res.status(201).json(event);
        } catch (err) { next(err); }
    }
    async updateEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const eventId = parseInt(req.params.eventId || '0');
            const body: any = req.body || {};
            const file = (req as any).file as Express.Multer.File | undefined;
            if (file && file.buffer) {
                const imageUrl = await uploadImageBuffer(file.buffer, 'event-banners');
                body.bannerImage = imageUrl;
            }
            const event = await EventService.updateEvent(eventId, organizerId, body);
            res.status(200).json(event);
        } catch (err) { next(err); }
    }
    async deleteEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const eventId = parseInt(req.params.eventId || '0');
            const event = await EventService.deleteEvent(eventId, organizerId);
            res.status(200).json(event);
        } catch (err) { next(err); }
    }
    async listEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const events = await EventService.listEvents(req.query);
            res.status(200).json(events);
        } catch (err) { next(err); }
    }
    
    async getOrganizerEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const events = await EventService.getOrganizerEvents(organizerId);
            res.status(200).json(events);
        } catch (err) { next(err); }
    }
    async getEventDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const eventId = parseInt(req.params.eventId || '0');
            if (!eventId || isNaN(eventId)) {
                return res.status(400).json({ message: 'Invalid event ID' });
            }
            const event = await EventService.getEventDetails(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.status(200).json(event);
        } catch (err) { next(err); }
    }
    async createTicketType(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const eventId = parseInt(req.params.eventId || '0');
            const ticket = await EventService.createTicketTypeForEvent(eventId, organizerId, req.body);
            res.status(201).json(ticket);
        } catch (err) { next(err); }
    }
    async updateTicketType(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const ticketTypeId = parseInt(req.params.ticketTypeId || '0');
            const ticket = await EventService.updateTicketType(ticketTypeId, organizerId, req.body);
            res.status(200).json(ticket);
        } catch (err) { next(err); }
    }
    async deleteTicketType(req: Request, res: Response, next: NextFunction) {
        try {
            const organizerId = (req as any).user.id;
            const ticketTypeId = parseInt(req.params.ticketTypeId || '0');
            const deleted = await EventService.deleteTicketType(ticketTypeId, organizerId);
            res.status(200).json(deleted);
        } catch (err) { next(err); }
    }
}

export default new EventController();
