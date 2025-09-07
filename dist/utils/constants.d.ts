export declare const APP_CONSTANTS: {
    readonly JWT_SECRET: string;
    readonly POINTS_REFERRAL_REWARD: 10000;
    readonly COUPON_VALUE: 10000;
    readonly COUPON_EXP_DAYS: 90;
    readonly PAYMENT_TIMEOUT_HOURS: 2;
    readonly ADMIN_DECISION_DAYS: 3;
    readonly EMAIL_VERIFICATION_HOURS: 24;
    readonly PASSWORD_RESET_HOURS: 1;
};
export declare const TRANSACTION_STATUS: {
    readonly WAITING_PAYMENT: "WAITING_PAYMENT";
    readonly WAITING_ADMIN_CONFIRMATION: "WAITING_ADMIN_CONFIRMATION";
    readonly DONE: "DONE";
    readonly REJECTED: "REJECTED";
    readonly CANCELED: "CANCELED";
    readonly EXPIRED: "EXPIRED";
};
export declare const EVENT_STATUS: {
    readonly DRAFT: "DRAFT";
    readonly PUBLISHED: "PUBLISHED";
    readonly CANCELED: "CANCELED";
};
export declare const USER_ROLES: {
    readonly CUSTOMER: "CUSTOMER";
    readonly ORGANIZER: "ORGANIZER";
};
export declare const POINT_SOURCES: {
    readonly REFERRAL_REWARD: "REFERRAL_REWARD";
    readonly PURCHASE_REDEEM: "PURCHASE_REDEEM";
    readonly ROLLBACK: "ROLLBACK";
};
export declare const DISCOUNT_TYPES: {
    readonly AMOUNT: "AMOUNT";
    readonly PERCENTAGE: "PERCENTAGE";
};
export declare const EMAIL_NOTIFICATION_TYPES: {
    readonly TRANSACTION_ACCEPTED: "TRANSACTION_ACCEPTED";
    readonly TRANSACTION_REJECTED: "TRANSACTION_REJECTED";
};
//# sourceMappingURL=constants.d.ts.map