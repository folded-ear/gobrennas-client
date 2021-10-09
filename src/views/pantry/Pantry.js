import { Typography } from "@material-ui/core";
import React, {
    useEffect,
    useState,
} from "react";
import InventoryApi from "../../data/InventoryApi";
import PageBody from "../common/PageBody";
import ElEdit from "../ElEdit";

export default function Pantry() {
    const [stuff, setStuff] = useState();
    const [adjust, setAdjust] = useState({raw: ""});
    useEffect(() => {
        InventoryApi.promiseInventory()
            .then(data => data.data)
            .then(setStuff);
    }, []);

    function handleAddNew() {
        console.log("ADD", adjust)
    }

    return <PageBody>
        <Typography variant="h2">Pantry</Typography>
        <pre>{JSON.stringify(stuff, null, 3)}</pre>
        <pre>{JSON.stringify(adjust, null, 3)}</pre>
        <table width="100%">
            <tfoot>
            <tr>
                <td>
                    <ElEdit
                        name={"adjust"}
                        value={adjust}
                        onChange={e => setAdjust(e.target.value)}
                        onPressEnter={handleAddNew}
                    />
                </td>
            </tr>
            </tfoot>
        </table>
    </PageBody>;
}
