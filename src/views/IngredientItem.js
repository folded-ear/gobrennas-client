import {
    Grid,
    IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LinkIcon from "@material-ui/icons/Link";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../data/dispatcher";
import PantryItemActions from "../data/PantryItemActions";
import TaskActions from "../data/TaskActions";
import useIngredientLO from "../data/useIngredientLO";
import { refType } from "../models/IngredientRef";
import history from "../util/history";
import Quantity from "./common/Quantity";
import SendToPlan from "./SendToPlan";

const useStyles = makeStyles(() => ({
    quantity: {
        textAlign: "right",
    },
    name: {
        textDecoration: "#999 dotted underline",
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

const IngredientItem = ({ingredient: ref, loggedIn}) => {
    const classes = useStyles();
    const iLO = useIngredientLO(ref.ingredientId);

    let left, right;
    if (ref.quantity != null) {
        left = <Quantity
            quantity={ref.quantity}
            units={ref.units}
        />;
    }

    if (iLO == null || !iLO.hasValue()) {
        right = ref.quantity == null
            ? ref.raw
            : ref.preparation;
        if (loggedIn) {
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
        const ingredient = iLO.getValueEnforcing();
        const isRecipe = ingredient.type === "Recipe";

        right = <>
            <span className={classes.name}>
                {ingredient.name}
            </span>
            {isRecipe && <>
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
            {!isRecipe && loggedIn && <>
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
    ingredient: refType.isRequired,
    loggedIn: PropTypes.bool,
};

export default IngredientItem;
