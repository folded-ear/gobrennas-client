import React from 'react'
import PropTypes from "prop-types"
import { Container } from "flux/utils"
import LibraryStore from "../data/LibraryStore"
import loadObjectOf from "../util/loadObjectOf"
import { refType } from "../models/IngredientRef"
import { Link } from "react-router-dom"
import { Icon } from "antd"
import Quantity from "./common/Quantity"

const Augment = ({text, prefix, suffix}) => text
    ? <React.Fragment>{prefix}{text}{suffix}</React.Fragment>
    : null

Augment.propTypes = {
    text: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    prefix: PropTypes.string,
    suffix: PropTypes.string,
}

const IngredientItem = ({ingredient: ref, iLO}) => {

    if (iLO == null || !iLO.hasValue()) {
        return <span>
            {ref.raw}
            {ref.ingredientId && <span>
                {" "}
                ({ref.ingredientId})
            </span>}
        </span>
    }

    const ingredient = iLO.getValueEnforcing()
    const isRecipe = ingredient.type === "Recipe"
    return (
    <span>
        <Quantity quantity={ref.quantity}
                  units={ref.units}
                  addSpace />
        {isRecipe
            ? <React.Fragment>
                {ingredient.name}
                {" "}
                <Link to={`/library/recipe/${ingredient.id}`}>
                    <Icon type="link" />
                </Link>
            </React.Fragment>
            : <span style={{
                textDecoration: "#999 dotted underline",
            }}>
                {ingredient.name}
            </span>}
        <Augment text={ref.preparation}
                 prefix=", " />
    </span>
  )
}

IngredientItem.propTypes = {
    ingredient: refType.isRequired,
    iLO: loadObjectOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
    })),
}

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
        }
    },
    {withProps: true},
)

IngCon.propTypes = {
    ingredient: refType.isRequired,
}

export default IngCon