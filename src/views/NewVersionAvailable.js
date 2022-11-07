import Button from "@material-ui/core/Button";
import React from "react";
import Dispatcher from "data/dispatcher";
import WindowActions from "data/WindowActions";
import Banner from "views/common/Banner";

const NewVersionAvailable = () =>
    <Banner
        severity="info"
        onClose={() => Dispatcher.dispatch({
            type: WindowActions.IGNORE_NEW_VERSION,
        })}
    >
        Foodinger has updated!
        {" "}
        <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => Dispatcher.dispatch({
                type: WindowActions.LAUNCH_NEW_VERSION,
            })}>
            Upgrade
        </Button>
        {" "}
        <Button
            size="small"
            variant="outlined"
            onClick={() => Dispatcher.dispatch({
                type: WindowActions.IGNORE_NEW_VERSION,
            })}>
            Ignore
        </Button>
    </Banner>;

export default NewVersionAvailable;
