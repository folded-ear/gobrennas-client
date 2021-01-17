import PropTypes from "prop-types";
import React from "react";
import TextractButton from "./TextractButton";
import TextractEditor from "./TextractEditor";
import TextractQueueBrowser from "./TextractQueueBrowser";

const TextractFormAugment = ({renderActions}) => {
    const [jobId, setJobId] = React.useState(null);
    const [browserOpen, setBrowserOpen] = React.useState(false);
    return <>
        <TextractButton
            onClick={() => setBrowserOpen(true)}
        />
        {jobId && <TextractEditor
            jobId={jobId}
            onClose={() => setJobId(null)}
            renderActions={renderActions}
        />}
        {browserOpen && <TextractQueueBrowser
            onSelect={id => {
                setJobId(id);
                setBrowserOpen(false);
            }}
            onUpload={file => console.log("UPLOAD", file)}
            onDelete={id => console.log("DELETE", id)}
            onClose={() => setBrowserOpen(false)}
        />}
    </>;
};

TextractFormAugment.propTypes = {
    renderActions: PropTypes.func.isRequired, // passed a Array<String>
};

export default TextractFormAugment;
