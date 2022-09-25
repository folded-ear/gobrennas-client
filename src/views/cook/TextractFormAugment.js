import PropTypes from "prop-types";
import React from "react";
import LoadingIndicator from "../common/LoadingIndicator";
import ClientId from "../../util/ClientId";
import LoadObject from "../../util/LoadObject";
import promiseWellSizedFile from "../../util/promiseWellSizedFile";
import TextractButton from "./TextractButton";
import TextractEditor from "./TextractEditor";
import TextractQueueBrowser from "./TextractQueueBrowser";
import TextractApi from "../../data/TextractApi";
import { useQueryClient } from "react-query";

const TextractFormAugment = ({ renderActions }) => {
    const [ browserOpen, setBrowserOpen ] = React.useState(false);
    const [ jobLO, setJobLO ] = React.useState(LoadObject.empty());
    const [ creating, setCreating ] = React.useState([]);
    const [ deleting, setDeleting ] = React.useState([]);
    const queryClient = useQueryClient();
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
            onClose={() => setBrowserOpen(false)}
            onSelect={id => {
                setJobLO(LoadObject.loading());
                TextractApi.promiseJob(id)
                    .then(data =>
                        setJobLO(LoadObject.withValue({
                            image: data.data.photo.url,
                            textract: data.data.lines || [],
                        })));
                setBrowserOpen(false);
            }}
            uploading={creating}
            onUpload={photo => {
                const id = ClientId.next();
                setCreating(curr => [{
                    id,
                    url: URL.createObjectURL(photo),
                    name: photo.name,
                    ready: false,
                }].concat(curr));
                promiseWellSizedFile(photo).then(p => {
                    TextractApi.promiseNewJob(p)
                        .finally(() => {
                            queryClient.invalidateQueries("textract-jobs");
                            setCreating(curr =>
                                curr.filter(p => {
                                    if (p.id === id) {
                                        URL.revokeObjectURL(p.url);
                                        return false;
                                    }
                                    return true;
                                }));
                        });
                });
            }}
            deleting={deleting}
            onDelete={id => {
                setDeleting(curr => curr.concat(id));
                return TextractApi.promiseJobDelete(id)
                    .finally(() => {
                        queryClient.invalidateQueries("textract-jobs");
                        setDeleting(curr =>
                            curr.filter(i => i !== id));
                    });
            }}
        />}
    </>;
};

TextractFormAugment.propTypes = {
    renderActions: PropTypes.func.isRequired, // passed a Array<String>
};

export default TextractFormAugment;
