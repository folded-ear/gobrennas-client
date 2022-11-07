import {
    Box,
    Container as Content,
    FormControlLabel,
    Grid,
    Paper,
    Switch,
    Typography,
    useScrollTrigger,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PostAdd } from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import dispatcher from "data/dispatcher";
import Dispatcher from "data/dispatcher";
import LibraryActions from "features/RecipeLibrary/data/LibraryActions";
import {
    SCOPE_EVERYONE,
    SCOPE_MINE,
} from "features/RecipeLibrary/data/LibraryStore";
import { Recipe } from "data/RecipeTypes";
import history from "util/history";
import { loadObjectOf } from "util/loadObjectTypes";
import FoodingerFab from "views/common/FoodingerFab";
import LazyInfinite from "views/common/LazyInfinite";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeCard from "features/RecipeLibrary/components/RecipeCard";
import SearchFilter from "features/RecipeLibrary/components/SearchFilter";

const useStyles = makeStyles((theme) => ({
    search: {
        margin: theme.spacing(4, 0),
        padding: theme.spacing(4, 2),
    },
    paddedContent: {
        paddingTop: 255,
    },
    fixedSearch: {
        position: "fixed",
        zIndex: 1100,
        padding: theme.spacing(2, 2),
        top: 80,
    },
    card: {
        display: "flex",
    },
}));

const updateFilter = filter =>
    Dispatcher.dispatch({
        type: LibraryActions.UPDATE_FILTER,
        filter,
    });

const clearFilter = () =>
    Dispatcher.dispatch({
        type: LibraryActions.CLEAR_FILTER,
    });

const toggleScope = (e) => {
    const everyone = e.target.checked;
    Dispatcher.dispatch({
        type: LibraryActions.SET_SCOPE,
        scope: everyone ? SCOPE_EVERYONE : SCOPE_MINE,
    });
};

function MessagePaper({primary, children}) {
    return <Paper
        style={{
            textAlign: "center",
        }}
    >
        <Box p={2} pb={1}>
            {children
                ? children
                : primary && <Typography variant="h5">
                    {primary}
                </Typography>}
        </Box>
    </Paper>;
}

MessagePaper.propTypes = {
    primary: PropTypes.string,
    children: PropTypes.node,
};

function RecipesList(props = {}) {
    const classes = useStyles();
    const isSearchHidden = useScrollTrigger({
        disableHysteresis: true,
        threshold: 250 - 75,
    });
    const {me, filter, scope, recipesLO, isComplete} = props;

    let body;
    if (recipesLO.hasValue()) {
        const lib = recipesLO.getValueEnforcing();
        const isLoading = recipesLO.isLoading();
        if (lib.length > 0) {
            body = <LazyInfinite
                loading={isLoading}
                complete={isComplete}
                onNeedMore={() => {
                    if (isComplete) return; // not required, but may as well
                    setTimeout(() =>
                        dispatcher.dispatch({
                            type: LibraryActions.SEARCH_FARTHER,
                        }));
                }}
            >
                <Grid
                    container
                    spacing={4}
                    alignItems="stretch"
                >
                    {lib.map(recipe =>
                        <Grid
                            item
                            md={4}
                            sm={6}
                            xs={12}
                            className={classes.card}
                            key={recipe.id}
                        >
                            <RecipeCard
                                recipe={recipe}
                                me={me}
                                indicateMine={scope === SCOPE_EVERYONE}
                                mine={recipe.ownerId === me.id}
                            />
                        </Grid>,
                    )}
                    {isComplete && lib.length > 5 && <Grid
                        item
                        xs={12}
                    >
                        <MessagePaper
                            primary={"That's it. Fin. The end."}
                        />
                    </Grid>}
                    {isLoading && <Grid
                        item
                        xs={12}
                    >
                        <LoadingIndicator
                            primary={"Searching..."}
                        />
                    </Grid>}
                </Grid>
            </LazyInfinite>;
        } else if (isLoading) {
            body = <LoadingIndicator />;
        } else {
            body = <MessagePaper
                primary={filter
                    ? "Zero recipes matched your filter. 🙁"
                    : "You don't have any recipes yet!"}
            />;
        }
    } else {
        body = <LoadingIndicator />;
    }
    return <Content
        className={isSearchHidden ? classes.paddedContent : null}
    >
        <Paper
            elevation={isSearchHidden ? 4 : 1}
            className={isSearchHidden ? classes.fixedSearch : classes.search}
        >
            {!isSearchHidden && <>
                <Typography variant="h5">Search Recipe Library</Typography>
                <div style={{float: "right"}}>
                    <FormControlLabel
                        control={
                            <Switch checked={scope === SCOPE_EVERYONE}
                                    name="scope"
                                    onChange={toggleScope}
                                    color="primary"
                            />
                        }
                        label={"Everyone"}
                        labelPlacement={"start"}
                    />
                </div>
            </>}
            <SearchFilter
                onChange={updateFilter}
                term={filter}
                onClear={clearFilter}
            />
        </Paper>
        {body}
        <FoodingerFab
            onClick={() => history.push(`/add`)}
        >
            <PostAdd />
        </FoodingerFab>
    </Content>;
}

RecipesList.defaultProps = {
    filter: "",
    scope: "mine",
};

RecipesList.propTypes = {
    me: PropTypes.object.isRequired,
    recipesLO: loadObjectOf(PropTypes.arrayOf(Recipe)).isRequired,
    isComplete: PropTypes.bool.isRequired,
    filter: PropTypes.string.isRequired,
    scope: PropTypes.string.isRequired,
};

export default RecipesList;
