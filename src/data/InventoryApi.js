import BaseAxios from "axios";
import { API_BASE_URL } from "../constants/index";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/inventory`,
});

const InventoryApi = {
    promiseInventory: () => axios.get("/"),
    promiseTransactionHistory: (itemId) => axios.get(`/item/${itemId}/tx`),
    promiseAddTransaction: (tx) => axios.post("/tx", tx),
};

export default InventoryApi;
