interface RegisterDTO {
    email: string;
    password: string;
    name?: string;
    role?: 'CUSTOMER' | 'ORGANIZER';
    referralCode?: string;
}
export declare class AuthService {
    register({ email, password, name, role, referralCode }: RegisterDTO): Promise<any>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: number;
            email: string;
            name: string | null;
            role: import("../generated/prisma").$Enums.Role;
        };
    }>;
    changePassword(userId: number, oldPass: string, newPass: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
        token?: never;
    } | {
        message: string;
        token: string;
    }>;
    resetPassword(token: string, newPass: string): Promise<{
        message: string;
    }>;
    updateProfile(userId: number, data: any): Promise<{
        id: number;
        email: string;
        name: string | null;
        profileImg: string | null;
        role: import("../generated/prisma").$Enums.Role;
    }>;
    uploadProfileImage(userId: number, image: any): Promise<{
        id: number;
        profileImg: string | null;
    }>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map