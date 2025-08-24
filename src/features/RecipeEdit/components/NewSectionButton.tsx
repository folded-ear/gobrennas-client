import { gql } from "@/__generated__";
import { UseRecipeFormReturn } from "@/data/hooks/useRecipeForm";
import { BfsId } from "@/global/types/identity";
import { AddIcon } from "@/views/common/icons";
import SplitButton, { SelectOption } from "@/views/common/SplitButton";
import { useQuery } from "@apollo/client";
import {
    Autocomplete,
    Button,
    ButtonProps,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { CommonProps } from "@mui/material/OverridableComponent";
import { Maybe } from "graphql/jsutils/Maybe";
import { useEffect, useRef, useState } from "react";

const SEARCH_SECTIONS = gql(`
query searchSections($query: String!) {
  library {
    sections(search: {
      query: $query
    }) {
      edges {
        node {
          id
          name
          sectionOf {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
}`);

interface SectionOption {
    id: BfsId;
    name?: string;
    sectionOf?: Maybe<{
        id: BfsId;
        name: string;
    }>;
    label: string;
}

type Props = {
    size?: ButtonProps["size"];
    className: CommonProps["className"];
} & Pick<UseRecipeFormReturn, "onAddOwnedSection" | "onAddByRefSection">;

const AND_MORE_ID = "...and more";
export default function NewSectionButton({
    size,
    className,
    onAddOwnedSection,
    onAddByRefSection,
}: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState<string>("");
    const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);

    const inputRef = useRef<HTMLElement>();
    useEffect(() => {
        if (!open) return;
        const to = setTimeout(
            () => inputRef.current && inputRef.current.focus(),
            125,
        );
        return () => clearTimeout(to);
    }, [open]);

    const { data, loading } = useQuery(SEARCH_SECTIONS, {
        skip: !open,
        fetchPolicy: "cache-and-network",
        variables: {
            query: query ?? "",
        },
    });
    useEffect(() => {
        if (!data) {
            setSectionOptions([]);
            return;
        }
        const options: SectionOption[] = data.library.sections.edges
            .filter((s) => s.node.sectionOf)
            .map((s) => ({
                ...s.node,
                label: `${s.node.name} (of ${s.node.sectionOf?.name})`,
            }));
        if (data.library.sections.pageInfo.hasNextPage) {
            options.push({ id: AND_MORE_ID, label: "... and more" });
        }
        setSectionOptions(options);
    }, [data]);

    const handleSplitSelect = (e: never, opt: SelectOption<never>) => {
        if (opt.id === "search") {
            setOpen(true);
        } else {
            onAddOwnedSection();
        }
    };
    const handleClose = () => {
        setOpen(false);
        setQuery("");
    };
    const handleSearch = (
        e: React.SyntheticEvent,
        q: string,
        reason: string,
    ) => {
        if (reason === "input") setQuery(q);
    };
    const handleSectionSelect = (
        e: React.SyntheticEvent,
        val: SectionOption | string,
    ) => {
        if (typeof val === "string" || val.id === AND_MORE_ID) return;
        onAddByRefSection(val);
        handleClose();
    };

    return (
        <>
            <SplitButton
                size={size}
                className={className}
                startIcon={<AddIcon />}
                color="neutral"
                variant="contained"
                onClick={() => onAddOwnedSection()}
                options={[
                    {
                        id: "new",
                        label: "New Blank Section",
                    },
                    {
                        id: "search",
                        label: "Add From Library",
                    },
                ]}
                onSelect={handleSplitSelect}
                primary={"Section"}
            />
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <Autocomplete
                        size={"small"}
                        freeSolo
                        value={query}
                        onInputChange={handleSearch}
                        onChange={handleSectionSelect}
                        disableClearable
                        fullWidth
                        loading={loading}
                        filterOptions={(x) => x}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                inputRef={inputRef}
                                variant="outlined"
                                placeholder={"Search Sections"}
                                sx={{ minWidth: "18em" }}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? (
                                                <CircularProgress
                                                    color="inherit"
                                                    size={20}
                                                />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        options={sectionOptions}
                        getOptionDisabled={(o) => o.id === AND_MORE_ID}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
