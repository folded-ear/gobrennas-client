/* eslint-disable no-console */
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE_URL } from "../constants";
import buildSequence from "./buildSequence";

const {
    next,
} = buildSequence();

export class SocketAdapter {
    constructor() {
        this._client = new Client({
            webSocketFactory() {
                return new SockJS(API_BASE_URL + "/api/_ws");
            },
            // debug(str) {
            //     console.log("WS-DEBUG", str);
            // },
        });
        this._client.onConnect = frame => {
            console.log("Connected: " + frame);
            this._connected = true;
            for (const id of this._subscriptions.keys()) {
                this._doSubscribe(id);
            }
            while (this._queue.length > 0) {
                this._client.publish(this._queue.shift());
            }
        };
        this._client.onDisconnect = frame => {
            this._connected = false;
            console.log("Disconnected: " + frame);
        };
        this._client.onStompError = frame => {
            if (typeof frame === "string") {
                // not an actual error, but rather stompClient saying "whoops"
                console.log("STOMP Jank: " + frame);
            } else {
                console.log("ERROR", frame);
            }
        };
        this._client.onWebSocketClose = evt => {
            this._connected = false;
            console.log("Socket Close", evt);
        };
        this._client.onWebSocketError = evt => {
            console.log("Socket Error", evt);
        };

        this._connected = false;
        this._subscriptions = new Map();
        this._queue = [];
    }

    subscribe(destination, callback, headers) {
        const id = (headers && headers.id) || next();
        this._activate();
        this._subscriptions.set(id, {
            id,
            destination,
            callback,
            headers: {
                ...headers,
                id,
            },
        });
        if (this._connected) {
            this._doSubscribe(id);
        }
        return {
            id,
            unsubscribe: () =>
                this._doUnsubscribe(id),
        };
    }

    publish(destination, body, headers) {
        this._activate();
        const packet = {
            destination,
            body,
            headers
        };
        if (this._connected) {
            this._client.publish(packet);
        } else {
            this._queue.push(packet);
        }
    }

    _activate() {
        if (!this._client.active) {
            this._client.activate();
        }
    }

    _doSubscribe(id) {
        const sub = this._subscriptions.get(id);
        if (sub == null) return;
        sub.token = this._client.subscribe(sub.destination, sub.callback, sub.headers);
    }

    _doUnsubscribe(id) {
        if (!this._subscriptions.has(id)) {
            throw new Error(`Unknown subscription '${id}'`);
        }
        if (this._connected) {
            this._subscriptions.get(id)
                .token
                .unsubscribe();
        }
        this._subscriptions.delete(id);
    }

}

export class JsonSocketAdapter {

    constructor() {
        this._raw = new SocketAdapter();
    }

    subscribe(destination, callback, headers) {
        return this._raw.subscribe(
            destination,
            packet => {
                const ct = (packet.headers["content-type"] || "");
                if (ct === "application/json" || ct.indexOf("application/json;") === 0) {
                    packet = {
                        ...packet,
                        body: JSON.parse(packet.body),
                    };
                }
                callback(packet);
            },
            headers
        );
    }

    publish(destination, body, headers) {
        if (typeof body !== "string") {
            body = JSON.stringify(body);
            if (!headers) headers = {};
            headers["content-type"] = "application/json";
        }
        this._raw.publish(destination, body, headers);
    }

}

export default new JsonSocketAdapter(); // todo: cull
