import React from 'react'
import PropTypes from "prop-types"
import { Container } from "flux/utils"
import LibraryStore from "../data/LibraryStore"
import loadObjectOf from "../util/loadObjectOf"
import { refType } from "../models/IngredientRef"

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

  return (
    <span>
        <Augment text={ref.quantity}
                 suffix=" " />
        <Augment text={ref.units}
                 suffix=" " />
        {iLO.getValueEnforcing().name}
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