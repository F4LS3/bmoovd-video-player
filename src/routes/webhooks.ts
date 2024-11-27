import express from "express";
import {createDiashow, DiashowStatus, logger, WebhookEvent} from "../helpers";
import {rmSync} from 'fs';

const router = express.Router();

//@ts-ignore
router.use((req, res, next) => {
    const event = req.headers['x-appwrite-webhook-events'];

    if(event.includes("create"))
        req.webhookEvent = WebhookEvent.CREATE;
    else if(event.includes("update"))
        req.webhookEvent = WebhookEvent.UPDATE;
    else if(event.includes("delete"))
        req.webhookEvent = WebhookEvent.DELETE;
    else
        req.webhookEvent = null;

    if(!req.webhookEvent) return res.status(400).send("No webhook event found");

    next();
});

router.post("/diashows", (req, res) => {
    const {status, $id, imageIds, timePerImage}: {status: DiashowStatus, $id: string, imageIds: string[], timePerImage: number, diashowFileId: string} = req.body;

    switch (req.webhookEvent) {
        case WebhookEvent.CREATE:
            if(status !== DiashowStatus.PENDING) break;

            createDiashow({timePerImage, imageFileIds: imageIds, diashowId: $id})
                .then(() => logger.info(`WebHook successfully built video file: ${$id}.mp4`))
                .catch(logger.error);

            break;
        case WebhookEvent.DELETE:
            if(status !== DiashowStatus.READY) break;
            rmSync(`${process.env.VIDEOS_DIR}/${$id}.mp4`);
            break;
    }

    res.status(204).send({});
});

router.post('/mpv', (req, res) => {
    // TODO: Bei update von einem player document das entsprechende video mit der diashowId abspielen auf dem geänderten player
    // TODO: Vorher den gewählten player stop befehl senden zum beenden des aktuellen videos
});

export default router;