import useActivePlanner from "@/data/useActivePlanner";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import { RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";

type Props = RouteComponentProps<{
    pid?: string;
}>;

const Planner = ({ match }: Props) => {
    const { data: plan, loading } = useActivePlanner();
    const planId = plan?.id ?? match.params.pid;

    if (loading) {
        return <LoadingIndicator />;
    }

    if (!planId) {
        return (
            <Redirect
                to={{
                    pathname: `/welcome`,
                }}
            />
        );
    }

    return (
        <Redirect
            to={{
                pathname: `/plan/${planId}`,
            }}
        />
    );
};

export default Planner;
