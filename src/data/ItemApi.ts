import BaseAxios from "axios";
import { API_BASE_URL } from "@/constants";
import serializeObjectOfPromiseFns from "@/util/serializeObjectOfPromiseFns";
import { BfsId } from "@/global/types/identity";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
});

export enum RecognitionRangeType {
    // noinspection JSUnusedGlobalSymbols
    UNKNOWN = "UNKNOWN",
    QUANTITY = "QUANTITY",
    // @deprecated - prefer QUANTITY
    AMOUNT = "AMOUNT",
    UNIT = "UNIT",
    NEW_UNIT = "NEW_UNIT",
    ITEM = "ITEM",
    NEW_ITEM = "NEW_ITEM",
}

interface RecognitionRange {
    start: number;
    end: number;
    type: RecognitionRangeType;
    // for QUANTITY ranges, the numeric quantity
    quantity: number;
    // for UNIT and ITEM ranges, the object's ID
    id: BfsId;
    // @deprecated - prefer quantity or id, based on type
    value: number;
}

interface RecognitionSuggestion {
    name: string;
    target: RecognitionRange;
}

export interface RecognitionResult {
    raw: string;
    cursor: number;
    ranges: RecognitionRange[];
    suggestions: RecognitionSuggestion[];
}

const ItemApi = {
    recognizeItem(
        raw: string,
        cursor = raw.length,
    ): Promise<RecognitionResult> {
        return axios
            .post(`/item/recognize`, {
                raw,
                cursor,
            })
            .then((r) => r.data);
    },
};

export default serializeObjectOfPromiseFns(ItemApi) as typeof ItemApi;
