import BaseAxios from "axios";
import PropTypes from "prop-types";
import React from "react";
import { Redirect } from "react-router-dom";
import { API_BASE_URL } from "../../constants";
import Dispatcher from "../../data/dispatcher";
import LibraryActions from "../../data/LibraryActions";
import LoadObject from "../../util/LoadObject";
import LoadingIndicator from "../common/LoadingIndicator";
import RecipeDetail from "./RecipeDetail";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/shared/recipe`,
});

const DoTheDance = props => {
    const {
        slug,
        secret,
        id,
    } = props;
    const [[recipe, owner], setData] = React.useState([]);
    React.useEffect(() => {
        axios.get(`/${slug}/${secret}/${id}.json`)
            .then(
                ({data: {
                    recipe,
                    owner,
                    ingredients,
                }}) => {
                    if (ingredients && ingredients.length) {
                        Dispatcher.dispatch({
                            type: LibraryActions.INGREDIENTS_LOADED,
                            ids: ingredients.map(i => i.id),
                            data: ingredients,
                            oneOff: true,
                        });
                    }
                    setData([recipe, owner]);
                },
                () => alert("There was an error loading the recipe. Refresh?")
            );
    }, [slug, secret, id]);
    if (!recipe) {
        return <LoadingIndicator />;
    }
    return <RecipeDetail
        anonymous
        recipeLO={LoadObject.withValue(recipe)}
        ownerLO={LoadObject.withValue(owner)}
    />;
};

DoTheDance.propTypes = {
    slug: PropTypes.string.isRequired,
    secret: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
};

const SharedRecipe = props => {
    const {
        authenticated,
        match:  {
            params: {
                id: rawId,
                ...params
            },
        },
    } = props;
    const id = parseInt(rawId);
    if (authenticated) {
        // At the moment, being a user means you can view any recipe...
        return <Redirect to={`/library/recipe/${id}`} />;
    }
    return <DoTheDance id={id} {...params} />;
};

SharedRecipe.propTypes = {
    authenticated: PropTypes.bool.isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
            slug: PropTypes.string.isRequired,
            secret: PropTypes.string.isRequired,
            id: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired
};

export default SharedRecipe;
