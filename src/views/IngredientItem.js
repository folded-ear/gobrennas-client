import {
    Grid,
    IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LinkIcon from "@material-ui/icons/Link";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "data/dispatcher";
import PantryItemActions from "data/PantryItemActions";
import { IngredientRef } from "data/RecipeTypes";
import TaskActions from "features/Planner/data/TaskActions";
import history from "util/history";
import Quantity from "views/common/Quantity";
import SendToPlan from "features/RecipeLibrary/components/SendToPlan";

const useStyles = makeStyles(() => ({
    quantity: {
        textAlign: "right",
    },
    name: {
        textDecorationColor: "#999",
        textDecorationStyle: "dotted",
        textDecorationLine: "underline",
    }
}));

const Augment = ({text, prefix, suffix}) => text
    ? <>{prefix}{text}{suffix}</>
    : null;

Augment.propTypes = {
    text: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    prefix: PropTypes.string,
    suffix: PropTypes.string,
};

const IngredientItem = ({ingRef: ref, hideRecipeLink, hideSendToPlan, inline}) => {
    const classes = useStyles();

    let left, right;
    if (ref.quantity != null) {
        left = <Quantity
            quantity={ref.quantity}
            units={ref.units}
        />;
    }

    if (ref.ingredient == null || typeof ref.ingredient === "string") {
        right = ref.quantity == null
            ? (ref.raw || ref.name)
            : ref.preparation;
        if (!hideSendToPlan) {
            right = <>
                {right}
                {" "}
                <SendToPlan
                    onClick={planId => Dispatcher.dispatch({
                        type: TaskActions.SEND_TO_PLAN,
                        planId,
                        name: ref.raw,
                    })}
                    iconOnly
                />
            </>;
        }
    } else {
        const ingredient = ref.ingredient;
        const isRecipe = ingredient.type === "Recipe";

        right = <>
            <span className={classes.name}>
                {ingredient.name}
            </span>
            {isRecipe && !hideRecipeLink && <>
                {" "}
                <IconButton
                    size={"small"}
                    onClick={() => history.push(`/library/recipe/${ingredient.id}`)}
                    title={`Open ${ingredient.name}`}
                >
                    <LinkIcon fontSize="inherit" />
                </IconButton>
            </>}
            <Augment
                text={ref.preparation}
                prefix=", "
            />
            {!isRecipe && !hideSendToPlan && <>
                {" "}
                <SendToPlan
                    onClick={planId => Dispatcher.dispatch({
                        type: PantryItemActions.SEND_TO_PLAN,
                        planId,
                        id: ingredient.id,
                        name: ingredient.name,
                    })}
                    iconOnly
                />
            </>}
        </>;
    }

    if (inline) {
        return <span>
            {left}
            {" "}
            {right}
        </span>;
    }

    return <Grid container spacing={2}>
        <Grid item xs={3} className={classes.quantity}>
            {left}
        </Grid>
        <Grid item xs={9}>
            {right}
        </Grid>
    </Grid>;
};

IngredientItem.propTypes = {
    ingRef: IngredientRef.isRequired,
    hideRecipeLink: PropTypes.bool,
    hideSendToPlan: PropTypes.bool,
    inline: PropTypes.bool,
};

export default IngredientItem;
