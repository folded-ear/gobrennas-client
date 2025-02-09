import { Typography } from "@mui/material";
import React, { useLayoutEffect, useState } from "react";

interface Props {
    url: string;
}

const Source: React.FC<Props> = ({ url }) => {
    const [hostname, setHostname] = useState("");
    useLayoutEffect(() => {
        try {
            let hostname = new URL(url).hostname;
            if (hostname.startsWith("www.")) {
                hostname = hostname.substring(4);
            }
            setHostname(hostname);
        } catch (e) {
            setHostname("");
        }
    }, [url]);
    return hostname ? (
        <Typography
            color={"secondary"}
            component={"a"}
            href={url}
            target="_blank"
            rel="noreferrer noopener"
        >
            {hostname}
        </Typography>
    ) : (
        <>{url}</>
    );
};

export default Source;
