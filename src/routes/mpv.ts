import express from "express";
import {logger, MPV_PLAYER_1, MPV_PLAYER_2} from "../helpers";
import {existsSync} from 'fs';

const router = express.Router();

router.use((req, res, next) => {
    if(!req.body.player) {
        res.status(400).send({status: 400, message: 'Invalid player'});
        return;
    }

    if(req.body.player !== 1 && req.body.player !== 2) {
        res.status(400).send({status: 400, message: 'Invalid player'});
        return;
    }

    req.player = req.body.player === 1 ? MPV_PLAYER_1 : MPV_PLAYER_2;

    next();
});

// @ts-ignore
router.post('/loadfile', (req, res) => {
    const {video} = req.body;

    if(!video) return res.status(400).send({status: 400, message: 'Invalid video'});
    if(!existsSync(`${process.env.VIDEOS_DIR}/${video}`)) return res.status(400).send({status: 400, message: 'Invalid video'});

    req.player.command(["loadfile", `${process.env.VIDEOS_DIR}/${video}`])
        .then((data: any) => {
            logger.info(`LoadFile: requestId: ${data.request_id}`);
            logger.info(`LoadFile: data: ${data.data}`);
            res.status(200).send({ data: data.data });
        })
});

router.post('/pause', (req: express.Request, res: express.Response) => {
    req.player.command(["set_property", "pause", true])
        .then((data: any) => {
            logger.info(`Pause: requestId: ${data.request_id}`);
            logger.info(`Pause: data: ${data.data}`);
            res.status(200).send({ data: data.data });
        })
});

router.post('/play', (req: express.Request, res: express.Response) => {
    req.player.command(["set_property", "pause", false])
        .then((data: any) => {
            logger.info(`Play: requestId: ${data.request_id}`);
            logger.info(`Play: data: ${data.data}`);
            res.status(200).send({ data: data.data });
        })
});

router.get('/time-pos', (req: express.Request, res: express.Response) => {
    req.player.command(["get_property", "time-pos"])
        .then((data: any) => {
            logger.info(`Time-Pos: requestId: ${data.request_id}`);
            logger.info(`Time-Pos: data: ${data.data}`);
            res.status(200).send({ data: data.data });
        })
});

router.post('/stop', (req: express.Request, res: express.Response) => {
    req.player.command(["stop"])
        .then((data: any) => {
            logger.info(`Stop: requestId: ${data.request_id}`);
            logger.info(`Stop: data: ${data.data}`);
            res.status(200).send({ data: data.data });
        })
});

export default router;