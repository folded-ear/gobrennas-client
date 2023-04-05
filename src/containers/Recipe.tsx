import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import React from "react";
import { RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";
import LoadObject from "util/LoadObject";
import { useProfileLO } from "../providers/Profile";
import { ScalingProvider } from "../util/ScalingContext";
import LoadingIndicator from "../views/common/LoadingIndicator";
import RecipeDetail from "../views/cook/RecipeDetail";
import {
    IngredientRef,
    Recipe as RecipeType,
} from "global/types/types";
import { gql } from "../__generated__";
import { useQuery } from "@apollo/client";
import { Subrecipe } from "../views/cook/SubrecipeItem";
import { AvatarData } from "../views/user/User";

export const buildFullRecipeLO = id => {
    let lo = LibraryStore.getIngredientById(id);
    if (!lo.hasValue()) return lo;

    const subIds = new Set();
    const subs: RecipeType[] = [];
    let loading = false;
    const prepRecipe = recipe => ({
        ...recipe,
        ingredients: (recipe.ingredients || []).map(ref => {
            if (!ref.ingredientId) return ref;
            const iLO = LibraryStore.getIngredientById(ref.ingredientId);
            if (iLO.isLoading()) {
                loading = true;
            }
            if (!iLO.hasValue()) return ref;
            const ing = iLO.getValueEnforcing();
            ref = {
                ...ref,
                ingredient: ing,
            };
            if (ing.type !== "Recipe") return ref;
            if (subIds.has(ing.id)) return ref;
            subIds.add(ing.id);
            subs.push(prepRecipe(ing));
            return ref;
        }),
    });
    const recipe = prepRecipe(lo.getValueEnforcing());
    recipe.subrecipes = subs;
    lo = LoadObject.withValue(recipe);
    if (loading) {
        lo = lo.loading();
    }
    return lo;
};

const recipeWithEverythingQuery = gql(`
query getRecipeWithEverything($id: ID!) {
  recipe: node(id: $id) {
    ... on Recipe {
      ...core
      favorite
      yield
      calories
      externalUrl
      labels
      photo {
        url
        focus
      }
      owner {
        id
        name
        email
        imageUrl
      }
      subrecipes {
        ...core
      }
    }
  }
}

fragment core on Recipe {
  id
  name
  directions
  totalTime
  ingredients {
    raw
    quantity {
      quantity
      units {
        name
      }
    }
    ingredient {
      __typename
      id
      name
    }
    preparation
  }
}
`);

type Props = RouteComponentProps<{
    id: string
}>;

interface State {
    recipeLO: LoadObject<RecipeType>,
    subrecipes?: Subrecipe[]
    mine: boolean
    ownerLO: LoadObject<AvatarData>
}

const Recipe: React.FC<Props> = ({ match }) => {
    const profileLO = useProfileLO();
    const { data, loading } = useQuery(recipeWithEverythingQuery, {
        variables: {
            id: match.params.id,
        },
    });
    if (data && data.recipe?.__typename === "Recipe") {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const gqlRef2Ref = (i: typeof data.recipe.ingredients[0]) => {
            const ref: IngredientRef = {
                raw: i.raw,
            };
            if (i.quantity) {
                const q = i.quantity;
                ref.quantity = q.quantity;
                if (q.units) {
                    ref.units = q.units.name;
                }
            }
            if (i.ingredient) {
                ref.ingredient = i.ingredient;
            }
            if (i.preparation) {
                ref.preparation = i.preparation;
            }
            return ref;
        };
        const recipe = data.recipe;
        const owner = recipe.owner;
        const state: State = {
            mine: profileLO.hasValue()
                ? "" + profileLO.getValueEnforcing().id === owner.id
                : false,
            ownerLO: LoadObject.withValue({
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                name: owner.name!,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                email: owner.email!,
                imageUrl: owner.imageUrl || undefined,
            }),
            recipeLO: LoadObject.withValue({
                id: recipe.id,
                name: recipe.name,
                ingredients: recipe.ingredients.map(gqlRef2Ref),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                directions: recipe.directions!,
                externalUrl: recipe.externalUrl || undefined,
                yield: recipe.yield || undefined,
                calories: recipe.calories || undefined,
                labels: recipe.labels || undefined,
                photo: recipe.photo?.url,
                photoFocus: recipe.photo?.focus || undefined,
            }),
            subrecipes: recipe.subrecipes.map(r => {
                const sr: Subrecipe = {
                    id: r.id,
                    name: r.name,
                    ingredients: r.ingredients.map(gqlRef2Ref),
                    directions: "",
                };
                if (r.directions) {
                    sr.directions = r.directions;
                }
                if (r.totalTime) {
                    sr.totalTime = r.totalTime;
                }
                return sr;
            }),
        };
        return <ScalingProvider>
            <RecipeDetail
                {...state}
                canFavorite
                canShare
                canSendToPlan
            />
        </ScalingProvider>;
    }

    if (loading) {
        return <LoadingIndicator />;
    }

    return <Redirect to="/library" />;
};

export default Recipe;
