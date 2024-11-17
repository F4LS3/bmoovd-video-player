import winston, {transports} from "winston";

const errorFilter = winston.format((info, opts) => {
    return info.level === 'error' ? info : false;
})

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(winston.format.timestamp({format: 'DD.MM.YYYY HH:mm:ss'}), winston.format.align(), winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: "./logs/combined.log",
            format: winston.format.combine(winston.format.timestamp({format: 'DD.MM.YYYY HH:mm:ss'}), winston.format.json())
        }),
        new transports.File({
            filename: "./logs/errors.log",
            level: "error",
            format: winston.format.combine(errorFilter(), winston.format.timestamp({format: 'DD.MM.YYYY HH:mm:ss'}), winston.format.json())
        })
    ]
});