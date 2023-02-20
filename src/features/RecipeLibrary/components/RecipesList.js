import {
    Box,
    Button,
    Container as Content,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    InputBase,
    Paper,
    Switch,
    Typography,
    useScrollTrigger,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PostAdd as AddIcon, Search as SearchIcon, } from "@material-ui/icons";
import Dispatcher from "data/dispatcher";
import { Recipe } from "data/RecipeTypes";
import RecipeCard from "features/RecipeLibrary/components/RecipeCard";
import LibraryActions from "features/RecipeLibrary/data/LibraryActions";
import { SCOPE_EVERYONE, SCOPE_MINE, } from "features/RecipeLibrary/data/LibraryStore";
import PropTypes from "prop-types";
import { useIsMobile } from "providers/IsMobile";
import React, { useEffect, useState } from "react";
import history from "util/history";
import { loadObjectOf } from "util/loadObjectTypes";
import FoodingerFab from "views/common/FoodingerFab";
import LazyInfinite from "views/common/LazyInfinite";
import LoadingIndicator from "views/common/LoadingIndicator";

const useStyles = makeStyles((theme) => {
    const search = {
        margin: theme.spacing(2, 0),
        padding: theme.spacing(1),
        display: "flex",
        alignItems: "center",
    };
    return ({
        search,
        paddedContent: {
            paddingTop: 85,
        },
        fixedSearch: {
            ...search,
            position: "fixed",
            zIndex: 1100,
            top: 70,
            minWidth: "70%",
        },
        divider: {
            height: theme.spacing(4),
            margin: theme.spacing(0, 1),
        },
        card: {
            display: "flex",
        },
    });
});

const toggleScope = (e) => {
    const everyone = e.target.checked;
    Dispatcher.dispatch({
        type: LibraryActions.SET_SCOPE,
        scope: everyone ? SCOPE_EVERYONE : SCOPE_MINE,
    });
};

function MessagePaper({ primary, children }) {
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
    const isSearchFloating = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
    });
    const isMobile = useIsMobile();
    const { me, filter, scope, recipesLO, isComplete } = props;
    const [ unsavedFilter, setUnsavedFilter ] = useState(filter);
    useEffect(() => {
        setUnsavedFilter(filter);
    }, [ filter ]);

    function handleSearchChange(e) {
        setUnsavedFilter(e.target.value);
    }

    function handleSearch(e) {
        e.preventDefault();
        e.stopPropagation();
        Dispatcher.dispatch({
            type: LibraryActions.UPDATE_FILTER,
            filter: unsavedFilter,
        });
    }

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
                        Dispatcher.dispatch({
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
        className={isSearchFloating ? classes.paddedContent : null}
    >
        <Paper
            elevation={isSearchFloating ? 4 : 1}
            className={isSearchFloating ? classes.fixedSearch : classes.search}
        >
            <InputBase
                value={unsavedFilter}
                onChange={handleSearchChange}
                className={classes.input}
                placeholder="Search Recipes"
                style={{ flexGrow: 2 }}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        handleSearch(e);
                    }
                }}
            />
            {isMobile || isSearchFloating
                ? <IconButton
                    color={"primary"}
                    onClick={handleSearch}
                >
                    <SearchIcon />
                </IconButton>
                : <Button
                    variant={"contained"}
                    onClick={handleSearch}
                    color="primary"
                    type="submit"
                    aria-label="search"
                    startIcon={<SearchIcon />}>
                    Search
                </Button>}
            <Divider className={classes.divider} orientation="vertical" />
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
        </Paper>
        {body}
        <FoodingerFab
            onClick={() => history.push(`/add`)}
        >
            <AddIcon />
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
