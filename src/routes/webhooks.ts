import express from "express";
import {logger} from "../helpers";

const router = express.Router();

router.post("/diashows", (req, res) => {
    const event = req.headers['X-Appwrite-Webhook-Events'];

    logger.info(event?.toString());

    res.status(204).send({});
});

export default router;