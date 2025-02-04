import { QueryClient } from "react-query";

/*
 This indirection allows for non-hook access to the query client, which is still
 needed. Stores, API objects, and class components can't use the hook, but they
 can do an import.
 */

export default new QueryClient();
