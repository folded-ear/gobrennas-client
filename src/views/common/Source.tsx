import React from "react";

interface Props {
    url: string
}

const Source: React.FC<Props> = ({ url }) => {
    try {
        const source = new URL(url);
        return (<a href={url} target="_blank" rel="noreferrer noopener">{source.hostname}</a>);
    } catch (e) {
        return <>{url}</>;
    }
};

export default Source;
