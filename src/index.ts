import {logger} from "./helpers";
import express from 'express';
import mpv from "./routes/mpv";

const app = express();

app.disable('x-powered-by');

app.use(express.json());

app.use('/mpv', mpv);

app.listen(8080, () => logger.info(`MPV-Rest live on port 8080`));