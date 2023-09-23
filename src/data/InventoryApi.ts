import BaseAxios from "axios";
import { API_BASE_URL } from "../constants";
import {
  Ingredient,
  Page,
  Quantity
} from "../global/types/types";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/inventory`,
});

export interface InventoryItemInfo {
    id: number;
    ingredient: Ingredient;
    quantity: Quantity[];
    txCount: number;
}

export enum TxType {
    ACQUIRE = "ACQUIRE",
    CONSUME = "CONSUME",
    DISCARD = "DISCARD",
    ADJUST = "ADJUST",
    RESET = "RESET",
}

export interface InventoryTxInfo {
    id: number;
    type: TxType;
    createdAt: string; // datetime
    quantity: Quantity[];
    newQuantity: Quantity[];
    ingredient: string;
    ingredientId: number;
}

const InventoryApi = {
    promiseInventory: () => axios.get<Page<InventoryItemInfo>>("/"),
    promiseTransactionHistory: (itemId) =>
        axios.get<Page<InventoryTxInfo>>(`/item/${itemId}/tx`),
    promiseAddTransaction: (tx) => axios.post<InventoryItemInfo>("/tx", tx),
};

export default InventoryApi;
