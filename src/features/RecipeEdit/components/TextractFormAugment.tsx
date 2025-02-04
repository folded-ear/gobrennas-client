import React from "react";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import ClientId from "@/util/ClientId";
import promiseWellSizedFile from "@/util/promiseWellSizedFile";
import TextractButton from "@/features/RecipeEdit/components/TextractButton";
import TextractQueueBrowser from "@/features/RecipeEdit/components/TextractQueueBrowser";
import TextractApi, { Job, PendingJob } from "@/data/TextractApi";
import { useQueryClient } from "react-query";
import TextractEditor, {
    RenderActionsForLines,
} from "@/features/RecipeEdit/components/TextractEditor";
import { RippedLO } from "@/util/ripLoadObject";
import { BfsId, bfsIdEq } from "@/global/types/identity";

interface Props {
    renderActions: RenderActionsForLines;
}

const TextractFormAugment: React.FC<Props> = ({ renderActions }) => {
    const [browserOpen, setBrowserOpen] = React.useState(false);
    const [jobLO, setJobLO] = React.useState<RippedLO<Job>>({});
    const [creating, setCreating] = React.useState<PendingJob[]>([]);
    const [deleting, setDeleting] = React.useState<BfsId[]>([]);
    const queryClient = useQueryClient();
    return (
        <>
            <TextractButton onClick={() => setBrowserOpen(true)} />
            {jobLO.data && (
                <TextractEditor
                    {...jobLO.data}
                    onClose={() => setJobLO({})}
                    renderActions={renderActions}
                />
            )}
            {jobLO.loading && <LoadingIndicator />}
            {browserOpen && (
                <TextractQueueBrowser
                    onClose={() => setBrowserOpen(false)}
                    onSelect={(id) => {
                        setJobLO({
                            loading: true,
                        });
                        TextractApi.promiseJob(id).then((data: Job) =>
                            setJobLO({
                                data,
                            }),
                        );
                        setBrowserOpen(false);
                    }}
                    uploading={creating}
                    onUpload={(photo) => {
                        const id = ClientId.next();
                        setCreating((curr) =>
                            [
                                {
                                    id,
                                    url: URL.createObjectURL(photo),
                                    name: photo.name,
                                    ready: false,
                                },
                            ].concat(curr),
                        );
                        promiseWellSizedFile(photo).then((p) => {
                            TextractApi.promiseNewJob(p).finally(() => {
                                queryClient.invalidateQueries("textract-jobs");
                                setCreating((curr) =>
                                    curr.filter((p) => {
                                        if (bfsIdEq(p.id, id)) {
                                            URL.revokeObjectURL(p.url);
                                            return false;
                                        }
                                        return true;
                                    }),
                                );
                            });
                        });
                    }}
                    deleting={deleting}
                    onDelete={(id) => {
                        setDeleting((curr) => curr.concat(id));
                        return TextractApi.promiseJobDelete(id).finally(() => {
                            queryClient.invalidateQueries("textract-jobs");
                            setDeleting((curr) =>
                                curr.filter((i) => !bfsIdEq(i, id)),
                            );
                        });
                    }}
                />
            )}
        </>
    );
};

export default TextractFormAugment;
