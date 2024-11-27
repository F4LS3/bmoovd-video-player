import express from "express";
import {createDiashow, DiashowStatus, logger, MPV_PLAYER_1, MPV_PLAYER_2, WebhookEvent} from "../helpers";
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
                .catch(err => logger.error(err));

            break;
        case WebhookEvent.DELETE:
            if(status !== DiashowStatus.READY) break;
            rmSync(`${process.env.VIDEOS_DIR}/${$id}.mp4`);
            break;
    }

    res.status(204).send({});
});

router.post('/mpv', (req, res) => {
    const {playerId, diashowId} = req.body;
    const player = playerId === 1 ? MPV_PLAYER_1 : MPV_PLAYER_2;

    switch (req.webhookEvent) {
        case WebhookEvent.UPDATE:
            player.command(["stop"])
                .then(() => {
                    logger.info(`Stopped playback for player ${playerId}`);

                    if(diashowId === null) return;

                    player.command(["loadfile", `${process.env.VIDEOS_DIR}/${diashowId}.mp4`])
                        .then(() => logger.info(`Now playing ${diashowId}.mp4 on ${playerId}`))
                        .catch(err => logger.error(err));
                })
                .catch(err => logger.error(err));

            break;
    }
    res.status(204).send({});
});

export default router;