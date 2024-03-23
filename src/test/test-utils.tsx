import theme from "theme";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import { ThemeProvider } from "@mui/material/styles";
import { mockQueries } from "test/mocks/api";
import { render, RenderOptions } from "@testing-library/react";
import * as React from "react";

type WrapperProps = {
    children?: React.ReactNode;
};

const TestWrapper: React.FC<WrapperProps> = ({ children }) => {
    return (
        <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={["/library/recipe/1/edit"]}>
                <MockedProvider mocks={mockQueries} addTypename={false}>
                    {children}
                </MockedProvider>
            </MemoryRouter>
        </ThemeProvider>
    );
};

export const renderWithProviders = (
    ui,
    options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: TestWrapper, ...options });

export * from "@testing-library/react";
