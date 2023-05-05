import Add from "@mui/icons-material/Add";
import {
    Box,
    List,
} from "@mui/material";
import Dispatcher from "data/dispatcher";
import LoadingItem from "features/Planner/components/LoadingItem";
import PlanHeader from "features/Planner/components/PlanHeader";
import PlanItem from "features/Planner/components/PlanItem";
import PlanActions from "features/Planner/data/PlanActions";
import { isParent } from "features/Planner/data/plannerUtils";
import PropTypes from "prop-types";
import React from "react";
import FoodingerFab from "views/common/FoodingerFab";
import LoadingIndicator from "views/common/LoadingIndicator";
import PageBody from "views/common/PageBody";
import { rippedLoadObjectOf } from "../../../util/ripLoadObject";

function Plan({
                  allLists: allPlans,
                  activeList: activePlan,
                  listDetailVisible: planDetailVisible,
                  taskTuples: itemTuples,
                  isTaskActive: isItemActive,
                  isTaskSelected: isItemSelected,
              }) {

    if (!allPlans.data) {
        return <LoadingIndicator
            primary="Loading plans..."
        />;
    }

    const handleAddNew = e => {
        e.preventDefault();
        Dispatcher.dispatch({
            type: PlanActions.CREATE_ITEM_AT_END,
        });
    };

    const plan = activePlan.data;
    const buckets = plan && plan.buckets;
    const canExpand = itemTuples.some(t =>
        t.data && isParent(t.data));
    return <PageBody hasFab>
        <Box py={2}>
            <PlanHeader
                allPlans={allPlans.data}
                activePlan={plan}
                planDetailVisible={planDetailVisible}
                hasBuckets={!!buckets}
                canExpand={canExpand}
            />
        </Box>
        <List>
            {itemTuples.map((item, i) => {
                const {
                    data,
                    loading,
                    depth,
                    ancestorDeleting,
                } = item;
                if (data) {
                    return <PlanItem
                        key={data.id}
                        plan={plan}
                        depth={depth}
                        task={data}
                        ancestorDeleting={ancestorDeleting}
                        loading={loading}
                        active={isItemActive(data)}
                        selected={isItemSelected(data)}
                        buckets={buckets}
                    />;
                } else {
                    return <LoadingItem
                        key={i}
                        depth={depth}
                    />;
                }
            })}
        </List>
        <FoodingerFab
            onClick={handleAddNew}
        >
            <Add />
        </FoodingerFab>
    </PageBody>;
}

Plan.propTypes = {
    allLists: rippedLoadObjectOf(PropTypes.any).isRequired,
    activeList: rippedLoadObjectOf(PropTypes.any),
    listDetailVisible: PropTypes.bool.isRequired,
    taskTuples: PropTypes.arrayOf(
        PropTypes.shape({
            data: PropTypes.any,
            loading: PropTypes.bool.isRequired,
            depth: PropTypes.number.isRequired,
            ancestorDeleting: PropTypes.bool,
        })),
    isTaskActive: PropTypes.func.isRequired,
    isTaskSelected: PropTypes.func.isRequired,
};

export default Plan;
