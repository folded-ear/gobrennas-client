import PageBody from "../common/PageBody";
import { UserProfileController } from "@/features/UserProfile/UserProfileController";

export const UserProfileView = () => {
    return (
        <PageBody>
            <UserProfileController />
        </PageBody>
    );
};
