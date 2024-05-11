import { AddIcon } from "views/common/icons";
import { List } from "@mui/material";
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
import DragContainer from "./DragContainer";

function Plan({
    allPlans,
    loading,
    activePlan,
    planDetailVisible,
    itemTuples,
    isItemActive,
    isItemSelected,
}) {
    if (loading) {
        return <LoadingIndicator primary="Loading plans..." />;
    }

    const handleAddNew = (e) => {
        e.preventDefault();
        Dispatcher.dispatch({
            type: PlanActions.CREATE_ITEM_AT_END,
        });
    };

    const handleDrop = (id, targetId, vertical, horizontal) => {
        const item = itemTuples.find((it) => it.data.id === targetId).data;
        if (!item) return;
        const action = {
            type: PlanActions.MOVE_SUBTREE,
            id,
        };
        if (horizontal === "right") {
            action.parentId = targetId;
            action.before = null; // last
        } else {
            action.parentId = item.parentId;
            if (vertical === "above") {
                action.before = targetId;
            } else {
                action.after = targetId;
            }
        }
        Dispatcher.dispatch(action);
    };

    const plan = activePlan.data;
    const buckets = plan && plan.buckets;
    const canExpand = itemTuples.some((t) => t.data && isParent(t.data));

    function renderItem(item, i = -1) {
        const { data, loading, depth, ancestorDeleting } = item;
        if (data) {
            return (
                <PlanItem
                    key={data.id}
                    plan={plan}
                    depth={depth}
                    item={data}
                    ancestorDeleting={ancestorDeleting}
                    loading={loading}
                    active={isItemActive(data)}
                    selected={isItemSelected(data)}
                    buckets={buckets}
                />
            );
        } else {
            return <LoadingItem key={i} depth={depth} />;
        }
    }

    return (
        <PageBody hasFab fullWidth>
            <PlanHeader
                allPlans={allPlans}
                activePlan={plan}
                planDetailVisible={planDetailVisible}
                hasBuckets={!!buckets}
                canExpand={canExpand}
            />
            <DragContainer
                onDrop={handleDrop}
                renderOverlay={(activeId) =>
                    renderItem(
                        itemTuples.find(
                            (it) => it.data && it.data.id === activeId,
                        ),
                    )
                }
            >
                <List>{itemTuples.map(renderItem)}</List>
            </DragContainer>
            <FoodingerFab onClick={handleAddNew}>
                <AddIcon />
            </FoodingerFab>
        </PageBody>
    );
}

Plan.propTypes = {
    allPlans: rippedLoadObjectOf(PropTypes.any).isRequired,
    activePlan: rippedLoadObjectOf(PropTypes.any),
    planDetailVisible: PropTypes.bool.isRequired,
    itemTuples: PropTypes.arrayOf(
        PropTypes.shape({
            data: PropTypes.any,
            loading: PropTypes.bool.isRequired,
            depth: PropTypes.number.isRequired,
            ancestorDeleting: PropTypes.bool,
        }),
    ),
    isItemActive: PropTypes.func.isRequired,
    isItemSelected: PropTypes.func.isRequired,
};

export default Plan;
