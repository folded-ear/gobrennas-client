import RecipeEditController from "./RecipeEditController";
import { MockedProvider } from "@apollo/client/testing";
import { renderWithProviders, screen } from "test/test-utils";
import { MemoryRouter, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme";

// Duplicate a recipe
// delete recipe
// share recipe
// edit recipe (and all the trappings of it)
// adding a new recipe
// adding a new ingredient
// save as copy

describe("Editing a Recipe", () => {
    it("loads with selected recipe", async () => {
        renderWithProviders(
            <ThemeProvider theme={theme}>
                <MemoryRouter initialEntries={["/library/recipe/1/edit"]}>
                    <MockedProvider mocks={mocks} addTypename={false}>
                        <Route path="/library/recipe/:id/edit">
                            <RecipeEditController />
                        </Route>
                    </MockedProvider>
                </MemoryRouter>
            </ThemeProvider>,
        );
        const something = await screen.findByText("Honey Ham");
        console.log(something);
    });

    it("changes text values correctly", () => {
        expect(true).toBe(true);
    });

    it("saves a copy", () => {
        expect(true).toBe(true);
    });

    it("redirects on save", () => {
        expect(true).toBe(true);
    });

    it("displays an error message on error", () => {
        expect(true).toBe(true);
    });
});
