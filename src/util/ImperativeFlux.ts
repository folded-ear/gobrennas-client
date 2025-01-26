import { useEffect } from "react";
import dispatcher from "@/data/dispatcher";
import { useHistory } from "react-router-dom";
import PlanActions from "@/features/Planner/data/PlanActions";

export default function ImperativeFlux() {
    const history = useHistory();
    useEffect(() => {
        const token = dispatcher.register((action) => {
            switch (action.type) {
                case PlanActions.PLAN_CREATED: {
                    history.push(`/plan/${action.id}`);
                    break;
                }
            }
        });
        return () => dispatcher.unregister(token);
    }, [history]);
    return null;
}
