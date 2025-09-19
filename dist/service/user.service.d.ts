export declare class UserService {
    getProfile(userId: number): Promise<{
        pointsBalance: number;
        referrerInfo: {
            name: string | null;
            email: string;
            role: import("../generated/prisma").$Enums.Role;
        } | null;
        organizerRating: number;
        organizerReviewCount: number;
        name: string | null;
        id: number;
        email: string;
        profileImg: string | null;
        role: import("../generated/prisma").$Enums.Role;
        isVerified: boolean;
        referralCode: string;
        referredByCode: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private getReferrerInfo;
    private calculatePointsBalance;
    private getOrganizerStats;
    updateProfile(userId: number, data: any): Promise<{
        name: string | null;
        id: number;
        email: string;
        password: string;
        profileImg: string | null;
        role: import("../generated/prisma").$Enums.Role;
        isVerified: boolean;
        referralCode: string;
        referredByCode: string | null;
        pointsBalance: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPoints(userId: number): Promise<{
        balance: number;
        details: {
            createdAt: Date;
            delta: number;
            source: import("../generated/prisma").$Enums.PointsSource;
            expiresAt: Date | null;
        }[];
    }>;
    getCoupons(userId: number): Promise<{
        coupons: {
            id: number;
            expiresAt: Date;
            code: string;
            discountType: import("../generated/prisma").$Enums.DiscountType;
            discountValue: number;
        }[];
    }>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=user.service.d.ts.map