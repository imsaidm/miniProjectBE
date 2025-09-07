export declare class PointsService {
    updateUserPointsBalance(userId: number): Promise<number>;
    validateAndUsePoints(userId: number, pointsUsed: number, tx: any): Promise<number>;
    refundPoints(userId: number, pointsUsed: number, tx: any): Promise<void>;
}
declare const _default: PointsService;
export default _default;
//# sourceMappingURL=points.service.d.ts.map