import express from "express";
import {logger, WebhookEvent} from "../helpers";

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
    logger.info(JSON.stringify(req.body));

    switch (req.webhookEvent) {
        case WebhookEvent.CREATE:
            break;
        case WebhookEvent.DELETE:
            break;
        case WebhookEvent.UPDATE:
            break;
    }

    res.status(204).send({});
});

export default router;