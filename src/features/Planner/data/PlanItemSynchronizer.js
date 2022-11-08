import React from "react";
import { useQuery } from "react-query";
import Dispatcher from "../../../data/dispatcher";
import PlanApi from "./PlanApi";
import TaskActions from "./TaskActions";

function PlanItemSynchronizer({ planId }) {
    const [ ts, setTs ] = React.useState(Date.now());
    const {
        data,
    } = useQuery([ "plan", planId, "items" ], () =>
        PlanApi.getItemsUpdatedSince(planId, ts).then(data => {
            setTs(Date.now());
            return data.data;
        }));
    React.useEffect(() => {
        if (!data) return;
        if (data.length === 0) return;
        Dispatcher.dispatch({
            type: TaskActions.LIST_DELTAS,
            id: planId,
            data,
        });
    }, [ data, planId ]);
    return null;
}

export default PlanItemSynchronizer;
