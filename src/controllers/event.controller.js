"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_service_1 = __importDefault(require("../service/event.service"));
const cloudinary_1 = require("../config/cloudinary");
class EventController {
    async createEvent(req, res, next) {
        try {
            const organizerId = req.user.id;
            const body = req.body || {};
            const file = req.file;
            if (file && file.buffer) {
                const imageUrl = await (0, cloudinary_1.uploadImageBuffer)(file.buffer, 'event-banners');
                body.bannerImage = imageUrl;
            }
            const event = await event_service_1.default.createEvent(organizerId, body);
            res.status(201).json(event);
        }
        catch (err) {
            next(err);
        }
    }
    async updateEvent(req, res, next) {
        try {
            const organizerId = req.user.id;
            const eventId = parseInt(req.params.eventId || '0');
            const body = req.body || {};
            const file = req.file;
            if (file && file.buffer) {
                const imageUrl = await (0, cloudinary_1.uploadImageBuffer)(file.buffer, 'event-banners');
                body.bannerImage = imageUrl;
            }
            const event = await event_service_1.default.updateEvent(eventId, organizerId, body);
            res.status(200).json(event);
        }
        catch (err) {
            next(err);
        }
    }
    async deleteEvent(req, res, next) {
        try {
            const organizerId = req.user.id;
            const eventId = parseInt(req.params.eventId || '0');
            const event = await event_service_1.default.deleteEvent(eventId, organizerId);
            res.status(200).json(event);
        }
        catch (err) {
            next(err);
        }
    }
    async listEvents(req, res, next) {
        try {
            const events = await event_service_1.default.listEvents(req.query);
            res.status(200).json(events);
        }
        catch (err) {
            next(err);
        }
    }
    async getOrganizerEvents(req, res, next) {
        try {
            const organizerId = req.user.id;
            const events = await event_service_1.default.getOrganizerEvents(organizerId);
            res.status(200).json(events);
        }
        catch (err) {
            next(err);
        }
    }
    async getEventDetails(req, res, next) {
        try {
            const eventId = parseInt(req.params.eventId || '0');
            if (!eventId || isNaN(eventId)) {
                return res.status(400).json({ message: 'Invalid event ID' });
            }
            const event = await event_service_1.default.getEventDetails(eventId);
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
            res.status(200).json(event);
        }
        catch (err) {
            next(err);
        }
    }
    async createTicketType(req, res, next) {
        try {
            const eventId = parseInt(req.params.eventId || '0');
            const ticket = await event_service_1.default.createTicketType(eventId, req.body);
            res.status(201).json(ticket);
        }
        catch (err) {
            next(err);
        }
    }
    async updateTicketType(req, res, next) {
        try {
            const organizerId = req.user.id;
            const ticketTypeId = parseInt(req.params.ticketTypeId || '0');
            const ticket = await event_service_1.default.updateTicketType(ticketTypeId, organizerId, req.body);
            res.status(200).json(ticket);
        }
        catch (err) {
            next(err);
        }
    }
    async deleteTicketType(req, res, next) {
        try {
            const organizerId = req.user.id;
            const ticketTypeId = parseInt(req.params.ticketTypeId || '0');
            const deleted = await event_service_1.default.deleteTicketType(ticketTypeId, organizerId);
            res.status(200).json(deleted);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.EventController = EventController;
exports.default = new EventController();
//# sourceMappingURL=event.controller.js.map