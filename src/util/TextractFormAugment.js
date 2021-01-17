import BaseAxios from "axios";
import PropTypes from "prop-types";
import React from "react";
import { API_BASE_URL } from "../constants";
import LoadingIndicator from "../views/common/LoadingIndicator";
import LoadObject from "./LoadObject";
import TextractButton from "./TextractButton";
import TextractEditor from "./TextractEditor";
import TextractQueueBrowser from "./TextractQueueBrowser";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/textract`,
});

const TextractFormAugment = ({renderActions}) => {
    const [browserOpen, setBrowserOpen] = React.useState(true);
    const [jobLO, setJobLO] = React.useState(LoadObject.empty());
    return <>
        <TextractButton
            onClick={() => setBrowserOpen(true)}
        />
        {jobLO.hasValue() && <TextractEditor
            {...jobLO.getValueEnforcing()}
            onClose={() => setJobLO(LoadObject.empty())}
            renderActions={renderActions}
        />}
        {jobLO.hasOperation() && <LoadingIndicator />}
        {browserOpen && <TextractQueueBrowser
            onSelect={id => {
                setJobLO(LoadObject.loading());
                axios.get(`/${id}`)
                    .then(data =>
                        setJobLO(LoadObject.withValue({
                            image: data.data.photo.url,
                            textract: data.data.lines,
                        })));
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
