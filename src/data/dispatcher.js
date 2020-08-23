import { Dispatcher } from "flux";
import ValidatingDispatcher from "./ValidatingDispatcher";

export default process.env.NODE_ENV === "production"
    ? new Dispatcher()
    : new ValidatingDispatcher();
