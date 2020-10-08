import {Icon} from "antd";
import {Container} from "flux/utils";
import PropTypes from "prop-types";
import React from "react";
import {Link} from "react-router-dom";
import LibraryStore from "../data/LibraryStore";
import {refType} from "../models/IngredientRef";
import loadObjectOf from "../util/loadObjectOf";
import Quantity from "./common/Quantity";

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
            </div>
        </span>;
    }

    const ingredient = iLO.getValueEnforcing();
    const isRecipe = ingredient.type === "Recipe";
    const units = uLO && uLO.hasValue() ? uLO.getValueEnforcing().name : ref.units;
    return (
    <span>
        <div style={{float: "left", width: "6em", textAlign: "right"}}>
        <Quantity quantity={ref.quantity}
                  units={units}/>
        </div>
        <div style={{marginLeft: "7em"}}>
        {isRecipe
            ? <React.Fragment>
                {ingredient.name}
                {" "}
                <Link to={`/library/recipe/${ingredient.id}`}>
                    <Icon type="link"/>
                </Link>
            </React.Fragment>
            : <span style={{
                textDecoration: "#999 dotted underline",
            }}>
                {ingredient.name}
            </span>}
        <Augment text={ref.preparation}
                 prefix=", " />
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
