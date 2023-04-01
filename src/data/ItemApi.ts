import BaseAxios from "axios";
import { API_BASE_URL } from "../constants";
import serializeObjectOfPromiseFns from "../util/serializeObjectOfPromiseFns";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
});

export enum RecognitionRangeType {
    // noinspection JSUnusedGlobalSymbols
    UNKNOWN = "UNKNOWN",
    AMOUNT = "AMOUNT",
    UNIT = "UNIT",
    NEW_UNIT = "NEW_UNIT",
    ITEM = "ITEM",
    NEW_ITEM = "NEW_ITEM",
}

interface RecognitionRange {
    start: number
    end: number
    type: RecognitionRangeType
    value: number
}

interface RecognitionSuggestion {
    name: string
    target: RecognitionRange
}

export interface RecognitionResult {
    raw: string
    cursor: number
    ranges: RecognitionRange[]
    suggestions: RecognitionSuggestion[]
}

const ItemApi = {

    recognizeItem(raw: string, cursor = raw.length): Promise<RecognitionResult> {
        return axios.post(`/item/recognize`, {
            raw,
            cursor,
        })
            .then(r => r.data);
    },

};

export default serializeObjectOfPromiseFns(ItemApi);
