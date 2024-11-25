import {EventEmitter} from "node:events";
import {Socket, connect} from "node:net";
import {logger} from "./helpers";

export class MPVClient extends EventEmitter {
    private readonly socketPath: string;
    private client: Socket;
    private requestId: number;

    private buffer: string = ""; // Puffer für unvollständige Nachrichten

    constructor(socketPath: string = '/tmp/mpvsocket') {
        super();

        this.socketPath = socketPath;
        this.requestId = 1;

        if(this.socketPath as any instanceof Socket) {
            this.client = this.socketPath as any;
        } else {
            this.client = connect(this.socketPath);
        }

        this.client.on('connect', () => logger.info(`Connected to MPV-Socket ${socketPath}`));
        this.client.on('close', () => logger.info(`Disconnected from MPV-Socket ${socketPath}`));
        this.client.on('error', err => logger.error(`MPV-Socket ${socketPath} Error: ${err}`));
        this.client.on('data', data => this.handleData(data));
    }

    private handleData(data: Buffer) {
        // Füge die empfangenen Daten in den Puffer ein
        this.buffer += data.toString();

        // Verarbeite Nachrichten, die durch \n abgeschlossen sind
        let newlineIndex;
        while ((newlineIndex = this.buffer.indexOf("\n")) !== -1) {
            const message = this.buffer.slice(0, newlineIndex); // Extrahiere eine vollständige Nachricht
            this.buffer = this.buffer.slice(newlineIndex + 1); // Entferne die verarbeitete Nachricht aus dem Puffer

            try {
                const json = JSON.parse(message);

                if (json.event) {
                    // Wenn es ein Event ist, emitte es
                    this.emit("event", json);
                } else if (json.request_id) {
                    // Wenn es eine Antwort auf eine Anfrage ist, emitte sie mit der request_id
                    this.emit(json.request_id.toString(), json);
                }
            } catch (err) {
                logger.error(`Failed to parse MPV IPC message: ${message}`);
            }
        }
    }

    public command(args: any[]) {
        return new Promise((resolve, reject) => {
            if(this.requestId === Number.MAX_SAFE_INTEGER) this.requestId = 1;

            const command = JSON.stringify({command: args, request_id: this.requestId});

            const eventName = args[0] === "loadfile" ? "event" : this.requestId.toString()

            this.once(eventName, response => {
                if(response.error !== "success") reject(new Error(`MPV Error: ${JSON.stringify(response)}`));

                resolve(response);
            });

            this.client.write(command + '\n');
            this.requestId++;
        });
    }
}