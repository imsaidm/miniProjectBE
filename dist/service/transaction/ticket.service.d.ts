export declare class TicketService {
    checkSeatAvailability(items: any[]): Promise<boolean>;
    validateAndReserveTickets(items: any[], tx: any): Promise<{
        subtotal: number;
        items: any[];
    }>;
    releaseTickets(items: any[], tx: any): Promise<void>;
    createAttendanceRecords(transaction: any, tx: any): Promise<void>;
}
declare const _default: TicketService;
export default _default;
//# sourceMappingURL=ticket.service.d.ts.map