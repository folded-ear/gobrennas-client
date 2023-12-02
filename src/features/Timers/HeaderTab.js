import React, { useState } from "react";
import PropTypes from "prop-types";
import TimerDrawer from "./components/TimerDrawer";
import TimerAlert from "./components/TimerAlert";
import NavTab from "./components/NavTab";

function HeaderTab({ label: defaultLabel }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <NavTab defaultLabel={defaultLabel} onClick={() => setOpen(true)} />
            <TimerDrawer open={open} onClose={() => setOpen(false)} />
            <TimerAlert />
        </>
    );
}

HeaderTab.propTypes = {
    label: PropTypes.string,
};

export default HeaderTab;
