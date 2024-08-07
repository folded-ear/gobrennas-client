import * as React from "react";
import { LibraryController } from "@/features/RecipeLibrary/LibraryController";

export const Library: React.FC = () => {
    return (
        <>
            <h1>Hello, Goat!</h1>
            <LibraryController />
        </>
    );
};
