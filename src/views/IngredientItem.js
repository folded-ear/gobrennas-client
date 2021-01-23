import { IconButton } from "@material-ui/core";
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

const Augment = ({text, prefix, suffix}) => text
    ? <React.Fragment>{prefix}{text}{suffix}</React.Fragment>
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

    if (iLO == null || !iLO.hasValue()) {
        return <span>
            <div style={{marginLeft: "7em"}}>
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
            </div>
        </span>;
    }

    const ingredient = iLO.getValueEnforcing();
    const isRecipe = ingredient.type === "Recipe";
    const units = uLO && uLO.hasValue() ? uLO.getValueEnforcing().name : ref.units;
    return (
    <span>
        <div style={{float: "left", width: "6em", textAlign: "right"}}>
            <Quantity
                quantity={ref.quantity}
                units={units}
            />
        </div>
        <div style={{
            marginLeft: "7em",
        }}>
            <span style={{
                textDecoration: "#999 dotted underline",
            }}>
                {ingredient.name}
            </span>
            {isRecipe && <React.Fragment>
                {" "}
                <IconButton
                    size={"small"}
                    onClick={() => history.push(`/library/recipe/${ingredient.id}`)}
                    title={`Open ${ingredient.name}`}
                >
                    <LinkIcon fontSize="inherit" />
                </IconButton>
            </React.Fragment>}
            <Augment
                text={ref.preparation}
                prefix=", "
            />
            {!isRecipe && <React.Fragment>
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
            </React.Fragment>}
        </div>
    </span>
  );
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
    IngredientItem,
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
