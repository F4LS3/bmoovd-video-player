"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mpv_1 = require("../mpv");
const helpers_1 = require("../helpers");
const router = express_1.default.Router();
const client = new mpv_1.MPVClient('/tmp/testsocket');
router.post('/loadfile', (req, res) => {
    client.command(["loadfile", "/home/linus/test.mp4"])
        .then((data) => {
        helpers_1.logger.info(`LoadFile: requestId: ${data.request_id}`);
        helpers_1.logger.info(`LoadFile: data: ${data.data}`);
        res.status(200).send({ data: data.data });
    });
});
router.post('/pause', (req, res) => {
    client.command(["set_property", "pause", true])
        .then((data) => {
        helpers_1.logger.info(`Pause: requestId: ${data.request_id}`);
        helpers_1.logger.info(`Pause: data: ${data.data}`);
        res.status(200).send({ data: data.data });
    });
});
router.post('/play', (req, res) => {
    client.command(["set_property", "pause", false])
        .then((data) => {
        helpers_1.logger.info(`Play: requestId: ${data.request_id}`);
        helpers_1.logger.info(`Play: data: ${data.data}`);
        res.status(200).send({ data: data.data });
    });
});
router.post('/time-pos', (req, res) => {
    client.command(["get_property", "time-pos"])
        .then((data) => {
        helpers_1.logger.info(`Time-Pos: requestId: ${data.request_id}`);
        helpers_1.logger.info(`Time-Pos: data: ${data.data}`);
        res.status(200).send({ data: data.data });
    });
});
exports.default = router;
