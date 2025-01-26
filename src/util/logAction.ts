import { FluxAction } from "@/global/types/types";

const logAction = (action: FluxAction) => {
    const temp: Record<string, unknown> = { ...action };
    delete temp.type;
    const keys = Object.keys(temp);
    const args: unknown[] = ["FLUX>", action.type.toString()];
    if (keys.length === 1) {
        args.push(keys[0], action[keys[0]]);
    } else {
        args.push(temp);
    }
    // eslint-disable-next-line no-console
    console.log(...args);
};

export default logAction;
