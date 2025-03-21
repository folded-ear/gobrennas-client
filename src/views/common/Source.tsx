import { Typography } from "@mui/material";
import * as React from "react";
import { useLayoutEffect, useState } from "react";

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
            // eslint-disable-next-line
            console.warn("failed to parse hostname", url, e);
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
