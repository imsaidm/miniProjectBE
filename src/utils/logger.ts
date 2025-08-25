import path from 'path';

import { createLogger, format, transports } from 'winston';

const logFormat = format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const filterLog = (level: string) => {
    return format((info) => {
        return info.level === level ? info : false;
    })();
}

const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json(),
        logFormat
    ),
    transports: [
        new transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            format: format.combine(filterLog("error")),
        }),

        new transports.File({
            filename: path.join(__dirname, '../../logs/info.log'),
            format: format.combine(filterLog("info")),
        }),

    ]
});



export default logger;

