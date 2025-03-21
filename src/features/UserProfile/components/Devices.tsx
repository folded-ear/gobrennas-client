import { gql } from "@/__generated__";
import { UserDevice } from "@/__generated__/graphql";
import useAdaptingQuery from "@/data/hooks/useAdaptingQuery";
import useIsDevMode from "@/data/useIsDevMode";
import deviceKey from "@/data/utils/deviceKey";
import { useIsMobile } from "@/providers/IsMobile";
import { relativeDate } from "@/util/time";
import { FavoriteIcon } from "@/views/common/icons";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import { useMutation } from "@apollo/client";
import { IconButton } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useCallback, useMemo } from "react";

type Device = Pick<UserDevice, "id" | "name" | "key" | "lastEnsuredAt">;

const GET_DEVICES = gql(`query myDevices {
  profile {
    me {
      devices {
        id
        name
        key
        lastEnsuredAt
      }
    }
  }
}`);

const RENAME_DEVICE = gql(`mutation renameDevice($id: ID!, $name: String!) {
  profile {
    renameDevice(id: $id, name: $name) {
      id
      key
      name
    }
  }
}`);

const COLUMNS: GridColDef<Device[][number]>[] = [
    {
        field: "id",
        headerName: "This Device",
        width: 54,
        renderHeader: () => null,
        renderCell: ({ row }) =>
            row.key === deviceKey ? (
                <IconButton
                    size="small"
                    title="The one you're using right now!"
                >
                    <FavoriteIcon color={"primary"} display="inline" />
                </IconButton>
            ) : null,
    },
    {
        field: "name",
        headerName: "Device",
        flex: 1,
        editable: true,
    },
    {
        field: "lastEnsuredAt",
        headerName: "Last Use",
        flex: 0.5,
        editable: false,
        renderCell: ({ row }) => {
            return relativeDate(new Date(row.lastEnsuredAt));
        },
    },
];

export default function Devices() {
    const devMode = useIsDevMode();
    const mobile = useIsMobile();
    const { data: devices, loading } = useAdaptingQuery(
        GET_DEVICES,
        (data) => data?.profile.me.devices,
    );
    const [renameDevice] = useMutation(RENAME_DEVICE);
    const handleRowUpdate = useCallback(
        async (newRow: Device, oldRow: Device) => {
            if (oldRow.name !== newRow.name) {
                const saved = await renameDevice({
                    variables: {
                        id: newRow.id,
                        name: newRow.name.trim() || `Device ${newRow.id}`,
                    },
                });
                return {
                    ...newRow,
                    name: saved.data!.profile.renameDevice.name,
                };
            }
            return oldRow;
        },
        [renameDevice],
    );
    const columns = useMemo(() => {
        return devMode && !mobile
            ? COLUMNS.concat({
                  field: "key",
                  headerName: "Key",
                  flex: 2,
              })
            : COLUMNS;
    }, [devMode, mobile]);
    if (loading || !devices) return <LoadingIndicator />;
    return (
        <DataGrid
            columns={columns}
            rows={devices}
            processRowUpdate={handleRowUpdate}
            density={"compact"}
            disableRowSelectionOnClick
            disableColumnSelector
            disableColumnFilter
            disableColumnMenu
            disableDensitySelector
            disableVirtualization
            disableMultipleRowSelection
            hideFooter
        />
    );
}
