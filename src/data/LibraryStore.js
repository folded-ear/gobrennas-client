import { ReduceStore } from "flux/utils";
import invariant from "invariant";
import PropTypes from "prop-types";
import qs from "qs";
import { removeDistinct } from "../util/arrayAsSet";
import { clientOrDatabaseIdType } from "../util/ClientId";
import debounce from "../util/debounce";
import history from "../util/history";
import LoadObject from "../util/LoadObject";
import LoadObjectMap from "../util/LoadObjectMap";
import LoadObjectState from "../util/LoadObjectState";
import {
    loadObjectMapOf,
    loadObjectStateOf,
} from "../util/loadObjectTypes";
import { fromMilliseconds } from "../util/time";
import typedStore from "../util/typedStore";
import Dispatcher from "./dispatcher";
import LibraryActions from "./LibraryActions";
import LibraryApi from "./LibraryApi";
import PantryItemActions from "./PantryItemActions";
import RecipeActions from "./RecipeActions";
import RecipeApi from "./RecipeApi";
import RouteActions from "./RouteActions";

export const SCOPE_MINE = "mine";
export const SCOPE_EVERYONE = "everyone";

export const adaptTime = (recipe) => {
    if (!recipe.totalTime) return recipe;
    return {
        ...recipe,
        totalTime: fromMilliseconds(recipe.totalTime),
    };
};

function searchHelper(state) {
    LibraryApi.searchLibrary(state.scope, state.filter, state.paging.pendingPage);
    const params = {
        q: state.filter,
    };
    if (state.scope !== SCOPE_MINE) {
        params.s = state.scope;
    }
    history.replace("?" + qs.stringify(params));
}

const debouncedHelper = debounce(searchHelper, 300);

function searchLibrary(state, scope, filter, debounce) {
    let doSearch = false;
    if (scope != null && scope !== state.scope) {
        doSearch = true;
        state = {
            ...state,
            scope: scope,
        };
    }
    if (filter != null && filter !== state.filter) {
        doSearch = true;
        state = {
            ...state,
            filter: filter,
        };
    }
    if (!doSearch) return state;
    state = {
        ...state,
        paging: {
            page: -1,
            pendingPage: 0,
            complete: false,
        },
        recipeIds: state.recipeIds.mapLO(lo => lo.loading()),
    };
    debounce ? debouncedHelper(state) : searchHelper(state);
    return state;
}

class LibraryStore extends ReduceStore {

    getInitialState() {
        return {
            // the real goodies
            byId: new LoadObjectMap(ids =>
                Dispatcher.dispatch({
                    type: LibraryActions.LOAD_INGREDIENTS,
                    ids: [...ids],
                })), // LoadObjectMap<ID, Ingredient>
            // used for bootstrapping (at the moment)
            recipeIds: new LoadObjectState(
                () =>
                    Dispatcher.dispatch({
                        type: LibraryActions.SEARCH,
                    }),
            ), // LoadObjectState<ID[]>
            paging: {
                page: -1,
                pendingPage: -2,
                complete: false,
            },
            scope: SCOPE_MINE,
            filter: null
        };
    }
    
    reduce(state, action) {
        switch (action.type) {

            case LibraryActions.SET_SCOPE: {
                return searchLibrary(state, action.scope);
            }

            case RouteActions.MATCH: {
                if (action.match.url !== "/library") return state;
                if (!action.location.search) return state;
                const params = qs.parse(action.location.search, { ignoreQueryPrefix: true });
                return searchLibrary(state, params.s || SCOPE_MINE, params.q);
            }
            
            case LibraryActions.UPDATE_FILTER: {
                return searchLibrary(state, undefined, action.filter, true);
            }

            case LibraryActions.CLEAR_FILTER: {
                return searchLibrary(state, undefined, "");
            }

            case LibraryActions.SEARCH: {
                return searchLibrary(state, undefined, state.filter || "");
            }

            case LibraryActions.SEARCH_FARTHER: {
                const paging = state.paging;
                if (paging.complete) return state;
                if (paging.page < 0) return state;
                if (paging.pendingPage !== paging.page) return state;
                state = {
                    ...state,
                    paging: {
                        ...paging,
                        pendingPage: paging.pendingPage + 1,
                    },
                };
                debouncedHelper(state);
                return state;
            }

            case RecipeActions.RECIPE_DELETED: {
                history.push("/library");
                return {
                    ...state,
                    byId: state.byId.delete(action.id),
                    recipeIds: state.recipeIds.map(ids =>
                        removeDistinct(ids, action.id)),
                };
            }

            case RecipeActions.CREATE_RECIPE: {
                return {
                    ...state,
                    byId: state.byId.set(action.data.id,
                        LoadObject.withValue(action.data).creating()),
                };
            }

            case RecipeActions.RECIPE_CREATED: {
                return {
                    ...state,
                    byId: state.byId
                        .set(action.data.id,
                            LoadObject.withValue(adaptTime(action.data)))
                        .delete(action.id),
                    recipeIds: state.recipeIds.map(ids =>
                        ids.concat(action.data.id))
                };
            }

            case RecipeActions.UPDATE_RECIPE: {
                return {
                    ...state,
                    byId: state.byId.update(action.data.id, lo => lo.updating()),
                };
            }

            case RecipeActions.RECIPE_UPDATED: {
                return {
                    ...state,
                    byId: state.byId.set(action.id,
                        LoadObject.withValue(adaptTime(action.data)).done()),
                };
            }

            case LibraryActions.LOAD_INGREDIENTS: {
                LibraryApi.getIngredientInBulk(action.ids);
                return {
                    ...state,
                    byId: action.ids.reduce((byId, id) =>
                        byId.set(id, LoadObject.loading()), state.byId),
                };
            }

            case LibraryActions.INGREDIENT_LOADED: {
                if (action.background && !state.byId.has(action.id)) {
                    // background update to something we don't have info about,
                    // so just ignore it.
                    return state;
                }
                return {
                    ...state,
                    byId: state.byId.set(action.id,
                        LoadObject.withValue(adaptTime(action.data))),
                };
            }

            case LibraryActions.INGREDIENTS_LOADED: {
                return {
                    ...state,
                    byId: action.data.reduce((byId, it) =>
                        byId.set(it.id, LoadObject.withValue(adaptTime(it))), state.byId),
                };
            }

            case LibraryActions.SEARCH_LOADED: {
                if (action.filter !== state.filter || action.scope !== state.scope) {
                    // out of order
                    // eslint-disable-next-line no-console
                    console.log("OUT OF ORDER - IGNORE", action.filter);
                    return state;
                }
                const newIds = action.data.content.map(r => r.id);
                return {
                    ...state,
                    paging: {
                        ...state.paging,
                        page: action.data.page,
                        complete: action.data.last,
                    },
                    recipeIds: state.recipeIds
                        .mapLO(lo => (lo.hasValue() && action.data.page > 0
                            ? lo.map(v => {
                                if (newIds.some(it => v.indexOf(it) >= 0)) {
                                    // eslint-disable-next-line no-console
                                    console.log("DUPLICATE INCOMING ID", v, newIds);
                                }
                                return v.concat(newIds);
                            })
                            : lo.setValue(newIds)).done()),
                    byId: action.data.content.reduce((byId, r) =>
                        byId.set(r.id, LoadObject.withValue(adaptTime(r))), state.byId),
                };
            }

            case RecipeActions.SEND_TO_PLAN: {
                RecipeApi.sendToPlan(
                    action.recipeId,
                    action.planId,
                );
                return state;
            }

            case PantryItemActions.ORDER_FOR_STORE: {
                if (!state.byId.has(action.id)) return state;
                const target = state.byId.get(action.targetId);
                if (!target || !target.hasValue()) return state;
                LibraryApi.orderForStore(action.id, action.targetId, action.after);
                return {
                    ...state,
                    byId: state.byId.update(action.id, lo => lo.map(v => ({
                        ...v,
                        storeOrder: target.getValueEnforcing().storeOrder +
                            (action.after ? 0.5 : -0.5)
                    })))
                };
            }

            // This takes place in ad hoc fashion, outside the normal edit flows
            // which uses DraftRecipeStore. So it's here.
            case RecipeActions.SET_RECIPE_PHOTO: {
                RecipeApi.setRecipePhoto(action.id, action.photo);
                return state;
            }

            default: {
                return state;
            }
        }
    }
    
    getRecipesLO() {
        return this.getState()
            .recipeIds
            .getLoadObject()
            .map(ids =>
                ids.map(id =>
                    this.getIngredientById(id).getValueEnforcing()));
    }

    isListingComplete() {
        return this.getState()
            .paging
            .complete;
    }

    getIngredientById(id) {
        const LOMap = this.getState().byId;
        let lo = LOMap.get(id);
        if (lo.isEmpty()) {
            lo = lo.loading();
        }
        return lo;
    }
    
    getRecipeById(selectedRecipe) {
        invariant(
            typeof selectedRecipe === "number",
            "That is not a valid integer",
        );
        return this.getIngredientById(selectedRecipe);
    }

}

LibraryStore.stateTypes = {
    byId: loadObjectMapOf(clientOrDatabaseIdType, PropTypes.shape({
        // all
        id: clientOrDatabaseIdType.isRequired,
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        // recipe
        ownerId: clientOrDatabaseIdType,
        externalUrl: PropTypes.string,
        ingredients: PropTypes.arrayOf(
            PropTypes.shape({
                raw: PropTypes.string.isRequired,
                quantity: PropTypes.number,
                units: PropTypes.string,
                uomId: PropTypes.number,
                ingredient: PropTypes.string,
                ingredientId: PropTypes.number,
                preparation: PropTypes.string,
            })
        ),
        directions: PropTypes.string,
        calories: PropTypes.number,
        yield: PropTypes.number,
        totalTime: PropTypes.number,
        labels: PropTypes.arrayOf(
            PropTypes.string
        ),
        // pantry item
        storeOrder: PropTypes.number,
    })),
    recipeIds: loadObjectStateOf(PropTypes.arrayOf(clientOrDatabaseIdType)),
    scope: PropTypes.string.isRequired,
    filter: PropTypes.string,
    paging: PropTypes.shape({
        page: PropTypes.number.isRequired,
        pendingPage: PropTypes.number.isRequired,
        complete: PropTypes.bool.isRequired,
    }),
};

export default typedStore(new LibraryStore(Dispatcher));
