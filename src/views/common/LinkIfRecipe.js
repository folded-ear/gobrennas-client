import {
    IconButton,
    Tooltip,
} from "@material-ui/core";
import { Kitchen } from "@material-ui/icons";
import { Container } from "flux/utils";
import PropTypes from "prop-types";
import React from "react";
import LibraryStore from "../../data/LibraryStore";
import history from "../../util/history";

const LinkIfRecipe = Container.createFunctional(
    ({lo, ...props}) => {
        if (!lo || !lo.hasValue()) return null;
        const ing = lo.getValueEnforcing();
        if (ing.type !== "Recipe") return null;
        return (
            <Tooltip
                title="Jump to Recipe in Library"
                placement="top"
            >
                <IconButton
                    onClick={() => history.push(`/library/recipe/${ing.id}`)}
                    {...props}
                >
                    <Kitchen />
                </IconButton>
            </Tooltip>
        );
    },
    () => [
        LibraryStore,
    ],
    (prevState, props) => ({
        ...props,
        lo: LibraryStore.getRecipeById(props.id),
    }),
    { withProps: true }
);

LinkIfRecipe.propTypes = {
    id: PropTypes.number.isRequired,
};

export default LinkIfRecipe;
