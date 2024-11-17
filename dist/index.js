"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const express_1 = __importDefault(require("express"));
const mpv_1 = __importDefault(require("./routes/mpv"));
const app = (0, express_1.default)();
app.disable('x-powered-by');
app.use(express_1.default.json());
app.use('/mpv', mpv_1.default);
app.listen(8080, () => helpers_1.logger.info(`MPV-Rest live on port 8080`));
