import { ActionType, FluxAction } from "@/data/dispatcher";

const logAction = (action: FluxAction) => {
    const temp: Record<string, unknown> = { ...action };
    delete temp.type;
    const keys = Object.keys(temp);
    const args: unknown[] = [
        "FLUX>",
        // this only works because Vite doesn't support `const enum`.
        ActionType[action.type]
            .replace("__", "/")
            .replace("_", "-")
            .toLowerCase() +
            "(" +
            action.type +
            ")",
    ];
    if (keys.length === 1) {
        args.push(keys[0], action[keys[0]]);
    } else {
        args.push(temp);
    }
    // eslint-disable-next-line no-console
    console.log(...args);
};

export default logAction;
