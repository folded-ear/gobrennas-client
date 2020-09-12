import React from "react";

const waitNoBuilder = Component =>
    // eslint-disable-next-line react/display-name
    props =>
        <Component
            variant="contained"
            {...props}
        >
            WAIT, NO!
        </Component>;

export default waitNoBuilder;
