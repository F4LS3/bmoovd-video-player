import winston, {transports} from "winston";
import {MPVClient} from "./mpv";
import {Client, Databases, Storage} from "node-appwrite";
import path from "path";
import * as fs from "node:fs";
import ffmpeg from 'fluent-ffmpeg';

const errorFilter = winston.format((info) => {
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

export const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_TOKEN);

export const storage = new Storage(client);
export const databases = new Databases(client);

export const createDiashow = async ({timePerImage, imageFileIds, diashowId}: {timePerImage: number, imageFileIds: string[], diashowId: string}) => {
    await databases.updateDocument(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_DIASHOWS_COLLECTION_ID, diashowId, { status: DiashowStatus.BUILDING });

    const tempDir = path.join(__dirname, 'temp_images');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const imageFiles = [];

    for (const imageFileId of imageFileIds) {
        const fileMetaData = (await storage.getFile(process.env.APPWRITE_IMAGES_BUCKET_ID, imageFileId));

        const fileName = fileMetaData.name.split(".");
        const fileExt = fileName[fileName.length - 1];

        const filePath = path.join(tempDir, `${imageFileId}.${fileExt}`);

        await new Promise((resolve, reject) => {
            storage.getFileDownload(process.env.APPWRITE_IMAGES_BUCKET_ID, imageFileId)
                .then(response => {
                    fs.writeFile(filePath, Buffer.from(response), err => {
                        if(err) return reject(err);

                        imageFiles.push(filePath);
                        resolve(null);
                    });
                })
                .catch((err) => logger.error(err));
        });
    }

    await new Promise(async (resolve, reject) => {
        const filterComplex = imageFiles
                .map((image, index) => {
                    return `[${index}:v]loop=${timePerImage * 25}:1:0,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS[v${index}]`;
                })
                .join('; ') +
            `; ${imageFiles.map((_, index) => `[v${index}]`).join('')}concat=n=${imageFiles.length}:v=1:a=0[outv]`;

        const command = ffmpeg();

        imageFiles.forEach(image => command.input(image));

        command
            .complexFilter(filterComplex, 'outv')
            .outputOptions('-preset', 'p7')
            .videoCodec('h264_nvenc')
            .output(`${process.env.VIDEOS_DIR}/${diashowId}.mp4`)
            .on('start', commandLine => logger.info(`FFMPEG-Command executed: ${commandLine}`))
            .on('error', err => logger.error(err))
            .on('error', reject)
            .on('end', async () => {
                await databases.updateDocument(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_DIASHOWS_COLLECTION_ID, diashowId, { status: DiashowStatus.READY });
                logger.info(`Diashow ${diashowId} successfully built`);
                resolve(null);
            })
            .run();
    });

    imageFiles.forEach(file => fs.unlinkSync(file));
    fs.rmdirSync(tempDir, { recursive: true });
}

export const MPV_PLAYER_1 = new MPVClient('/tmp/SOCKET_SCREEN0');
export const MPV_PLAYER_2 = new MPVClient('/tmp/SOCKET_SCREEN1');

export enum WebhookEvent {
    CREATE= "create",
    DELETE = "delete",
    UPDATE = "update",
}

export enum DiashowStatus {
    PENDING = "PENDING",
    BUILDING = "BUILDING",
    READY = "READY",
    ACTIVE = "ACTIVE",
}