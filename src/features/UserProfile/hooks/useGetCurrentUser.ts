import { GetCurrentUserQuery } from "@/features/UserProfile/data/queries";
import { useQuery } from "@apollo/client";

export const useGetCurrentUser = () => {
    const { loading, error, data } = useQuery(GetCurrentUserQuery);

    return {
        data,
        loading,
        error,
    };
};
