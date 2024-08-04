import { Dispatcher } from "flux";
import ValidatingDispatcher from "@/data/ValidatingDispatcher";
import { FluxAction } from "@/global/types/types";

export default process.env.NODE_ENV === "production"
    ? new Dispatcher<FluxAction>()
    : new ValidatingDispatcher();
