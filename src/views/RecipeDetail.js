import {
    Affix,
    Button,
    List,
    Spin,
} from "antd";
import PropTypes from "prop-types";
import React from "react";
import { Redirect } from "react-router-dom";
import Dispatcher from "../data/dispatcher";
import LibraryActions from "../data/LibraryActions";
import RecipeActions from "../data/RecipeActions";
import RecipeApi from "../data/RecipeApi";
import { Recipe } from "../data/RecipeTypes";
import history from "../util/history";
import loadObjectOf from "../util/loadObjectOf";
import AddToList from "./AddToList";
import DeleteButton from "./common/DeleteButton";
import Directions from "./common/Directions";
import IngredientItem from "./IngredientItem";
import LabelItem from "./LabelItem";
import User from "./user/User";

const RecipeDetail = ({recipeLO, mine, staged, ownerLO}) => {

    if (!recipeLO.hasValue()) {
        if (recipeLO.isLoading()) {
            return <Spin tip="Recipe is loading..."/>;
        }
        return <Redirect to="/library" />;
    }
    
    const recipe = recipeLO.getValueEnforcing();

    return (
        <div>
            <Button.Group>
                <Button
                    icon="close"
                    onClick={() => history.push("/library")}
                >Close</Button>
                {mine && (staged
                    ? <Button
                        icon="export"
                        onClick={() => Dispatcher.dispatch({
                            type: LibraryActions.UNSTAGE_RECIPE,
                            id: recipe.id,
                        })}
                    >Unstage</Button>
                    : <Button
                        icon="import"
                        onClick={() => Dispatcher.dispatch({
                            type: LibraryActions.STAGE_RECIPE,
                            id: recipe.id,
                        })}
                    >Stage</Button>
                )}
                <Button
                    icon="copy"
                    onClick={() => history.push(`/library/recipe/${recipe.id}/make-copy`)}
                >{mine ? "Copy" : "Duplicate to My Library"}</Button>
                {mine && <Button
                    icon="edit"
                    onClick={() => history.push(`/library/recipe/${recipe.id}/edit`)}
                >Edit</Button>}
                {mine && <DeleteButton
                    type="recipe"
                    label={"Delete"}
                    onConfirm={() => RecipeApi.deleteRecipe(recipe.id)}
                />}
            </Button.Group>


            <Affix offsetTop={0}>
                {!mine && ownerLO.hasValue() && <p style={{float: "right"}}>
                    <User {...ownerLO.getValueEnforcing()} />
                </p>}
                <h2 style={{
                    backgroundColor: "white",
                }}>{recipe.name}</h2>
            </Affix>

            {recipe.externalUrl && <React.Fragment>
                <h5>Source</h5>
                <p><a href={recipe.externalUrl}>{recipe.externalUrl}</a></p>
            </React.Fragment>}

            {recipe.ingredients != null && recipe.ingredients.length > 0 && <React.Fragment>
                <h3>Ingredients</h3>
                <List
                    dataSource={recipe.ingredients}
                    renderItem={it => <List.Item>
                        <IngredientItem ingredient={it} />
                    </List.Item>}
                    size="small"
                    split={false}
                    footer={<AddToList onClick={planId => Dispatcher.dispatch({
                        type: RecipeActions.SEND_TO_PLAN,
                        recipeId: recipe.id,
                        planId,
                    })} />}
                />
            </React.Fragment>}

            {recipe.directions && <React.Fragment>
                <h3>Directions</h3>
                <Directions text={recipe.directions} />
            </React.Fragment>}

            {recipe.yield && <React.Fragment>
                <h3>Yield</h3>
                <p>{recipe.yield} servings</p>
            </React.Fragment>}

            {recipe.totalTime && <React.Fragment>
                <h3>Total time</h3>
                <p>{recipe.totalTime} minutes</p>
            </React.Fragment>}

            {recipe.calories && <React.Fragment>
                <h3>Calories</h3>
                <p>{recipe.calories} calories</p>
            </React.Fragment>}

            {recipe.labels && recipe.labels
                .filter(label => label.indexOf("--") !== 0)
                .map(label =>
                    <LabelItem key={label} label={label} />)}

        </div>
    );
};

RecipeDetail.propTypes = {
    recipeLO: loadObjectOf(Recipe).isRequired,
    mine: PropTypes.bool,
    ownerLO: loadObjectOf(PropTypes.object),
    staged: PropTypes.bool,
};

export default RecipeDetail;
