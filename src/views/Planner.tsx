import React from "react";
import { Redirect } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import useActivePlanner from "@/data/useActivePlanner";
import LoadingIndicator from "@/views/common/LoadingIndicator";

type Props = RouteComponentProps<{
    pid?: string;
}>;

export const Planner: React.FC<Props> = ({ match }) => {
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
