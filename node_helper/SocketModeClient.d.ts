import { EventEmitter } from 'eventemitter3';
import * as WebSocket from 'ws';
import { AppsConnectionsOpenResponse, WebClientOptions } from '@slack/web-api';
import { LogLevel, Logger } from 'node_modules/@slack/socket-mode/dist/logger';
/**
 * An Socket Mode Client allows programs to communicate with the
 * [Slack Platform's Events API](https://api.slack.com/events-api) over a websocket.
 * This object uses the EventEmitter pattern to dispatch incoming events and has a built in send method to
 * acknowledge incoming events over the websocket.
 */
export declare class SocketModeClient extends EventEmitter {
    /**
     * Whether or not the client is currently connected to the web socket
     */
    connected: boolean;
    /**
     * Whether or not the client has authenticated to the Socket Mode API. This occurs when the connect method
     * completes, and a WebSocket URL is available for the client's connection.
     */
    authenticated: boolean;
    /**
     * Whether this client will automatically reconnect when (not manually) disconnected
     */
    private autoReconnectEnabled;
    /**
     * The number of milliseconds to wait upon connection for reply messages from the previous connection. The default
     * value is 2 seconds.
     */
    /**
     * State machine that backs the transition and action behavior
     */
    private stateMachine;
    /**
     * Configuration for the state machine
     */
    private stateMachineConfig;
    /**
     * The client's websockets
     */
    websocket?: WebSocket;
    private secondaryWebsocket?;
    private webClient;
    /**
     * The name used to prefix all logging generated from this object
     */
    private static loggerName;
    /**
     * This object's logger instance
     */
    private logger;
    /**
     * How long to wait for pings from server before timing out
     */
    private clientPingTimeout;
    /**
     * reference to the timeout timer we use to listen to pings from the server
     */
    private pingTimeout;
    /**
     * Used to see if a websocket stops sending heartbeats and is deemed bad
     */
    private badConnection;
    /**
     * WebClient options we pass to our WebClient instance
     * We also reuse agent and tls for our websocket connection
     */
    private clientOptions;
    constructor({ logger, logLevel, autoReconnectEnabled, clientPingTimeout, appToken, clientOptions, }?: SocketModeOptions);
    /**
     * Begin an Socket Mode session. This method must be called before any messages can
     * be sent or received.
     */
    start(): Promise<AppsConnectionsOpenResponse>;
    /**
     * End a Socket Mode session. After this method is called no messages will be sent or received unless you call
     * start() again later.
     */
    disconnect(): Promise<void>;
    /**
     * Method for sending an outgoing message of an arbitrary type over the websocket connection.
     * Primarily used to send acknowledgements back to slack for incoming events
     * @param id the envelope id
     * @param body the message body
     */
    private send;
    /**
     * Set up method for the client's websocket instance. This method will attach event listeners.
     */
    private setupWebSocket;
    /**
     * Tear down method for the client's websocket instance. This method undoes the work in setupWebSocket(url).
     */
    private teardownWebsocket;
    /**
     * confirms websocket connection is still active
     * fires whenever a ping event is received
     */
    private heartbeat;
    /**
     * `onmessage` handler for the client's websocket. This will parse the payload and dispatch the relevant events for
     * each incoming message.
     */
    private onWebsocketMessage;
}
export default SocketModeClient;
export interface SocketModeOptions {
    appToken?: string;
    logger?: Logger;
    logLevel?: LogLevel;
    autoReconnectEnabled?: boolean;
    clientPingTimeout?: number;
    clientOptions?: Omit<WebClientOptions, 'logLevel' | 'logger'>;
}
//# sourceMappingURL=SocketModeClient.d.ts.map