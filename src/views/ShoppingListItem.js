import React from 'react'
import { List } from "antd"
import Quantity from "./common/Quantity"

const ShoppingListItem = it =>
    typeof it === "string"
        ? <List.Item>&quot;{it}&quot;</List.Item>
        : <List.Item>
            {it.ingredient.name} ({it.quantities.map((q, i, a) =>
            <span key={q.units}>
                {i > 0 && ", "}
                {i > 0 && i === a.length - 1 && " and"}
                <Quantity
                    quantity={q.quantity}
                    units={q.units}/>
        </span>,
        )})
        </List.Item>

export default ShoppingListItem
