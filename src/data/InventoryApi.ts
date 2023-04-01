import BaseAxios from "axios";
import { API_BASE_URL } from "../constants";
import {
    Ingredient,
    Page,
    Quantity,
} from "../global/types/types";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/inventory`,
});

interface InventoryItemInfo {
    id: number
    ingredient: Ingredient
    quantity: Quantity[]
    txCount: number
}

enum TxType {
    ACQUIRE = "ACQUIRE",
    CONSUME = "CONSUME",
    DISCARD = "DISCARD",
    ADJUST = "ADJUST",
    RESET = "RESET",
}

interface InventoryTxInfo {
    id: number
    type: TxType
    createdAt: string // datetime
    quantity: Quantity[]
    newQuantity: Quantity[]
    ingredient: string
    ingredientId: number
}

const InventoryApi = {
    promiseInventory(): Promise<Page<InventoryItemInfo>> {
        return axios.get("/");
    },
    promiseTransactionHistory(itemId: number): Promise<Page<InventoryTxInfo>> {
        return axios.get(`/item/${itemId}/tx`);
    },
    promiseAddTransaction(tx: InventoryTxInfo): Promise<InventoryItemInfo> {
        return axios.post("/tx", tx);
    },
};

export default InventoryApi;
