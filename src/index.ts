import {logger} from "./helpers";
import express from 'express';
import mpv from "./routes/mpv";
import {MPVClient} from "./mpv";

declare global {
    namespace Express {
        interface Request {
            player: MPVClient;
        }
    }
}

const app = express();

app.disable('x-powered-by');

app.use(express.json());

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl} | ${req.ip}`);
    logger.info(JSON.stringify(req.body));

    next();
});

app.use('/mpv', mpv);

app.listen(8080, () => logger.info(`MPV-Rest live on port 8080`));