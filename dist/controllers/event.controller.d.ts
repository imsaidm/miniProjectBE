import { Request, Response, NextFunction } from 'express';
export declare class EventController {
    createEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void>;
    listEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getOrganizerEvents(req: Request, res: Response, next: NextFunction): Promise<void>;
    getEventDetails(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    createTicketType(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateTicketType(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteTicketType(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: EventController;
export default _default;
//# sourceMappingURL=event.controller.d.ts.map