import {
    Grid,
    IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LinkIcon from "@material-ui/icons/Link";
import { Container } from "flux/utils";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../data/dispatcher";
import LibraryStore from "../data/LibraryStore";
import PantryItemActions from "../data/PantryItemActions";
import TaskActions from "../data/TaskActions";
import { refType } from "../models/IngredientRef";
import history from "../util/history";
import { loadObjectOf } from "../util/loadObjectTypes";
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

const IngredientItem = ({ingredient: ref, iLO, uLO}) => {
    const classes = useStyles();
    let left, right;

    if (iLO == null || !iLO.hasValue()) {
        right = <>
            {ref.raw}
            {ref.ingredientId && <span>
                    {" "}
                ({ref.ingredientId})
                </span>}
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
    } else {
        const ingredient = iLO.getValueEnforcing();
        const isRecipe = ingredient.type === "Recipe";
        const units = uLO && uLO.hasValue() ? uLO.getValueEnforcing().name : ref.units;

        left = <Quantity
            quantity={ref.quantity}
            units={units}
        />;

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
            {!isRecipe && <>
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
    iLO: loadObjectOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
    })),
    uLO: loadObjectOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
    })),
};

const IngCon = Container.createFunctional(
    props => <IngredientItem {...props} />,
    () => [
        LibraryStore,
    ],
    (prevState, {ingredient: ref}) => {
        return {
            ingredient: ref,
            iLO: ref.ingredientId != null
                ? LibraryStore.getIngredientById(ref.ingredientId)
                : null,
            uLO: ref.uomId != null
                ? null // todo: set up canonical unit names!
                : null,
        };
    },
    {withProps: true},
);

IngCon.propTypes = {
    ingredient: refType.isRequired,
};

export default IngCon;
