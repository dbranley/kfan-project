import React from "react";
import { it, describe, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import App from "../App.jsx";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        }
    }
});

const queryProvider = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    }
}

describe("App.jsx", () => {
    it("First test in project, make sure App renders fine", () => {
        render(<App/>, { wrapper: queryProvider });
        // render(<QueryClientProvider client={queryClient}><App/></QueryClientProvider>);
        screen.debug();
    });
})
