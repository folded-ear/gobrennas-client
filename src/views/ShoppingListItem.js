import { List } from "antd";
import React from "react";
import OxfordList from "./common/OxfordList";
import Quantity from "./common/Quantity";

const ShoppingListItem = it =>
    typeof it === "string"
        ? <List.Item>&quot;{it}&quot;</List.Item>
        : <List.Item>
            {it.ingredient.name}
            <OxfordList
                prefix=" ("
                suffix=")"
            >
                {it.quantities.map(q =>
                    <Quantity
                        key={q.units}
                        quantity={q.quantity}
                        units={q.units}/>)}
            </OxfordList>
        </List.Item>;

export default ShoppingListItem;
