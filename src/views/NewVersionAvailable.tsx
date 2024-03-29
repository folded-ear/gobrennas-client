import Button from "@mui/material/Button";
import React from "react";
import Dispatcher from "data/dispatcher";
import WindowActions from "data/WindowActions";
import Banner from "views/common/Banner";

const NewVersionAvailable = () => (
    <Banner severity="info">
        Brenna&apos;s Food Software has updated!{" "}
        <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={() =>
                Dispatcher.dispatch({
                    type: WindowActions.LAUNCH_NEW_VERSION,
                })
            }
        >
            Relaunch
        </Button>
    </Banner>
);

export default NewVersionAvailable;
