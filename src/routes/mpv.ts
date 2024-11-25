import express from "express";
import {logger, MPV_PLAYER_1, MPV_PLAYER_2} from "../helpers";

const router = express.Router();


router.post('/loadfile', (req: express.Request, res: express.Response) => {
    const {player} = req.body;

    if(!player) {
        res.status(400).send({ status: 400, message: 'Invalid player' });
        return;
    }

    if(player !== 1 && player !== 2) {
        res.status(400).send({ status: 400, message: 'Invalid player' });
        return;
    }

    if(player === 1) {
        MPV_PLAYER_1.command(["loadfile", "/home/linus/test.mp4"])
            .then((data: any) => {
                logger.info(`LoadFile: requestId: ${data.request_id}`);
                logger.info(`LoadFile: data: ${data.data}`);
                res.status(200).send({ data: data.data });
            })
    } else {
        MPV_PLAYER_2.command(["loadfile", "/home/linus/test.mp4"])
            .then((data: any) => {
                logger.info(`LoadFile: requestId: ${data.request_id}`);
                logger.info(`LoadFile: data: ${data.data}`);
                res.status(200).send({ data: data.data });
            });
    }
});

router.post('/pause', (req: express.Request, res: express.Response) => {
    const {player} = req.body;

    if(!player) {
        res.status(400).send({ status: 400, message: 'Invalid player' });
        return;
    }

    if(player !== 1 && player !== 2) {
        res.status(400).send({ status: 400, message: 'Invalid player' });
        return;
    }


    if(player === 1) {
        MPV_PLAYER_1.command(["set_property", "pause", true])
            .then((data: any) => {
                logger.info(`Pause: requestId: ${data.request_id}`);
                logger.info(`Pause: data: ${data.data}`);
                res.status(200).send({ data: data.data });
            })
    } else {
        MPV_PLAYER_2.command(["set_property", "pause", true])
            .then((data: any) => {
                logger.info(`Pause: requestId: ${data.request_id}`);
                logger.info(`Pause: data: ${data.data}`);
                res.status(200).send({ data: data.data });
            })
    }
});

router.post('/play', (req: express.Request, res: express.Response) => {
    const {player} = req.body;

    if(!player) {
        res.status(400).send({ status: 400, message: 'Invalid player' });
        return;
    }

    if(player !== 1 && player !== 2) {
        res.status(400).send({ status: 400, message: 'Invalid player' });
        return;
    }

    if(player === 1) {
        MPV_PLAYER_1.command(["set_property", "pause", false])
            .then((data: any) => {
                logger.info(`Play: requestId: ${data.request_id}`);
                logger.info(`Play: data: ${data.data}`);
                res.status(200).send({ data: data.data });
            })
    } else {
        MPV_PLAYER_2.command(["set_property", "pause", false])
            .then((data: any) => {
                logger.info(`Play: requestId: ${data.request_id}`);
                logger.info(`Play: data: ${data.data}`);
                res.status(200).send({ data: data.data });
            })
    }
});

router.get('/time-pos', (req: express.Request, res: express.Response) => {
    const {player} = req.body;

    if(!player) {
        res.status(400).send({ status: 400, message: 'Invalid player' });
        return;
    }

    if(player !== 1 && player !== 2) {
        res.status(400).send({ status: 400, message: 'Invalid player' });
        return;
    }

    if(player === 1) {
        MPV_PLAYER_1.command(["get_property", "time-pos"])
            .then((data: any) => {
                logger.info(`Time-Pos: requestId: ${data.request_id}`);
                logger.info(`Time-Pos: data: ${data.data}`);
                res.status(200).send({ data: data.data });
            })
    } else {
        MPV_PLAYER_2.command(["get_property", "time-pos"])
            .then((data: any) => {
                logger.info(`Time-Pos: requestId: ${data.request_id}`);
                logger.info(`Time-Pos: data: ${data.data}`);
                res.status(200).send({ data: data.data });
            })
    }
});

export default router;