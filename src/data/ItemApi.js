import debounce from "../util/debounce";
import socket from "../util/socket";

const resolvers = new Map();

let subscription;

const unsubscribe = () => {
    if (!subscription) return;
    subscription.unsubscribe();
    subscription = null;
};

const unsubscribeInABit = debounce(unsubscribe, 30 * 1000);

const ensureSubscribed = () => {
    if (subscription) return;
    subscription = socket.subscribe(
        "/user/queue/item/recognize",
        message => {
            const body = message.body;
            const key = `${body.cursor}:${body.raw}`;
            if (!resolvers.has(key)) return;
            resolvers.get(key).forEach(r => r(body));
            resolvers.delete(key);
            unsubscribeInABit();
        },
    );
};

const ItemApi = {

    recognizeItem(raw, cursor = raw.length) {
        return new Promise(resolve => {
            ensureSubscribed();
            const key = `${cursor}:${raw}`;
            if (!resolvers.has(key)) {
                resolvers.set(key, [resolve]);
            } else {
                resolvers.get(key).push(resolve);
            }
            // Even if there's already one in flight, send it again in case of
            // network/error etc. We won't get a failure like a REST call. It'd
            // probably be better to manage this with exp-backoff retry?
            socket.publish("/api/item/recognize", {
                raw,
                cursor,
            });
        });
    }

};

export default ItemApi;
