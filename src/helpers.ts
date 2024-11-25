import winston, {transports} from "winston";
import {MPVClient} from "./mpv";

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

export const MPV_PLAYER_1 = new MPVClient('/tmp/SOCKET_SCREEN0');
export const MPV_PLAYER_2 = new MPVClient('/tmp/SOCKET_SCREEN1');