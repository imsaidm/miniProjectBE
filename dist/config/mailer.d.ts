export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
}
export declare function sendEmail(options: SendEmailOptions): Promise<{
    delivered: boolean;
    info?: any;
}>;
//# sourceMappingURL=mailer.d.ts.map