"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPVClient = void 0;
const node_events_1 = require("node:events");
const node_net_1 = require("node:net");
const helpers_1 = require("./helpers");
class MPVClient extends node_events_1.EventEmitter {
    constructor(socketPath = '/tmp/mpvsocket') {
        super();
        this.socketPath = socketPath;
        this.requestId = 1;
        if (this.socketPath instanceof node_net_1.Socket) {
            this.client = this.socketPath;
        }
        else {
            this.client = (0, node_net_1.connect)(this.socketPath);
        }
        this.client.on('connect', () => helpers_1.logger.info(`Connected to MPV-Socket ${socketPath}`));
        this.client.on('close', () => helpers_1.logger.info(`Disconnected from MPV-Socket ${socketPath}`));
        this.client.on('error', err => helpers_1.logger.error(`MPV-Socket ${socketPath} Error: ${err}`));
        this.client.on('data', data => this.handleData(data));
    }
    handleData(data) {
        const json = JSON.parse(data);
        this.emit(json.request_id.toString(), json);
    }
    command(args) {
        return new Promise((resolve, reject) => {
            if (this.requestId === Number.MAX_SAFE_INTEGER)
                this.requestId = 1;
            const command = JSON.stringify({ command: args, request_id: this.requestId });
            this.once(this.requestId.toString(), response => {
                if (response.error !== "success")
                    reject(new Error(`MPV Error: ${JSON.stringify(response)}`));
                resolve(response);
            });
            this.client.write(command + '\n');
            this.requestId++;
        });
    }
}
exports.MPVClient = MPVClient;
