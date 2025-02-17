import { GET_RECOGNIZED_ITEM } from "@/data/queries";
import { BfsId } from "@/global/types/identity";
import { client } from "@/providers/ApolloClient";
import serializeObjectOfPromiseFns from "@/util/serializeObjectOfPromiseFns";
import { RecognizedRangeType } from "@/__generated__/graphql";
import { Maybe } from "graphql/jsutils/Maybe";

export interface RecognitionRange {
    start: number;
    end: number;
    type: RecognizedRangeType;
    // for QUANTITY ranges, the numeric quantity
    quantity?: Maybe<number>;
    // for UNIT and ITEM ranges, the object's ID
    id?: Maybe<BfsId>;
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
    promiseRecognizedItem(
        raw: string,
        cursor: number = raw.length,
    ): Promise<RecognitionResult> {
        return client
            .query({
                query: GET_RECOGNIZED_ITEM,
                variables: { raw, cursor },
                // always hit the server, and don't cache the results
                fetchPolicy: "no-cache",
            })
            .then(({ data }) => data!.library.recognizeItem);
    },
};

export default serializeObjectOfPromiseFns(ItemApi);
