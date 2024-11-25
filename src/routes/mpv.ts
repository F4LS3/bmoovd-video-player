import express from "express";
import {MPVClient} from "../mpv";
import {logger} from "../helpers";

const router = express.Router();

const client = new MPVClient('/tmp/SOCKET_SCREEN0');

router.post('/loadfile', (req: express.Request, res: express.Response) => {
    client.command(["loadfile", "/home/linus/test.mp4"])
        .then((data: any) => {
            logger.info(`LoadFile: requestId: ${data.request_id}`);
            logger.info(`LoadFile: data: ${data.data}`);
            res.status(200).send({ data: data.data });
        })
});

router.post('/pause', (req: express.Request, res: express.Response) => {
    client.command(["set_property", "pause", true])
        .then((data: any) => {
            logger.info(`Pause: requestId: ${data.request_id}`);
            logger.info(`Pause: data: ${data.data}`);
            res.status(200).send({ data: data.data });
        })
});

router.post('/play', (req: express.Request, res: express.Response) => {
    client.command(["set_property", "pause", false])
        .then((data: any) => {
            logger.info(`Play: requestId: ${data.request_id}`);
            logger.info(`Play: data: ${data.data}`);
            res.status(200).send({ data: data.data });
        })
});

router.get('/time-pos', (req: express.Request, res: express.Response) => {
    client.command(["get_property", "time-pos"])
        .then((data: any) => {
            logger.info(`Time-Pos: requestId: ${data.request_id}`);
            logger.info(`Time-Pos: data: ${data.data}`);
            res.status(200).send({ data: data.data });
        })
});

export default router;