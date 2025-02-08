import { useEffect } from "react";
import dispatcher from "@/data/dispatcher";
import { useHistory } from "react-router-dom";

export default function ImperativeFlux() {
    const history = useHistory();
    useEffect(() => {
        const token = dispatcher.register((action) => {
            switch (action.type) {
                case "plan/plan-created": {
                    history.push(`/plan/${action.id}`);
                    break;
                }
            }
        });
        return () => dispatcher.unregister(token);
    }, [history]);
    return null;
}
