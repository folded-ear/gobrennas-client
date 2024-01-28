import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { LibraryController } from "../LibraryController";

const mocks = []; // We'll fill this in next

jest.mock("providers/Profile", () => {
    return {
        useProfile: () => ({
            id: 373,
            name: "Brenna Switzer",
            email: "brenna.switzer@gmail.com",
            imageUrl:
                "https://lh3.googleusercontent.com/a/ACg8ocLE73pCfyshoFIZPWqVVwYRZo8YG_Uk7sADqvfj7qInKSw=s96-c",
            provider: "google",
            roles: ["USER", "DEVELOPER"],
        }),
    };
});

jest.mock("react-router-dom", () => ({
    useHistory: () => ({
        location: {
            search: "?q=creamy&s=MINE",
        },
    }),
}));

describe("Recipe Library", () => {
    it("renders without error", async () => {
        render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <LibraryController />
            </MockedProvider>,
        );
        expect(
            await screen.findByText("Zero recipes matched your filter. 🙁"),
        ).toBeInTheDocument();
    });
});
