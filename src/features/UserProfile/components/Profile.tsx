import * as React from "react";
import type { UserType } from "global/types/identity";

interface Props {
    currentUser: UserType;
}

export const Profile: React.FC<Props> = ({ currentUser }) => {
    return (
        <>
            {currentUser.imageUrl && (
                <img
                    src={currentUser.imageUrl}
                    alt={currentUser.name || currentUser.email || undefined}
                    title="Holy moley, you're attractive!"
                />
            )}
            <div className="profile-name">
                <h2>{currentUser.name}</h2>
                <p className="profile-email">{currentUser.email}</p>
            </div>
        </>
    );
};
