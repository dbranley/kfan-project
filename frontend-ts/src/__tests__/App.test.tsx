import React from "react";
import { it, describe, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import App from "../App";

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

vi.mock('../services/auth.ts', async () => {
    return {
        getCurrentUser: vi.fn().mockReturnValue({email: "unknown", id: 0, username: "unknown"}),
        SESSION_EXPIRATION_TIME: 900000,
        logout: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
    }
});

vi.mock('../services/photo-cards.ts', async () => {
    return {
        getPhotoCards: vi.fn().mockReturnValue([]),
        getPhotoCard: vi.fn(),
        addPhotoCard: vi.fn(),
        deletePhotoCard: vi.fn(),
        addPhotoCardFavorite: vi.fn(),
        removePhotoCardFavorite: vi.fn(),
        updatePhotoCard: vi.fn(), 
    }
});

window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    }
}

describe("App.tsx", () => {
    it("First test in project, make sure App renders fine", async () => {
        // render(<App/>, { wrapper: queryProvider });
        render(<QueryClientProvider client={queryClient}><App /></QueryClientProvider>);
        // render(<QueryClientProvider client={queryClient}><App/></QueryClientProvider>);
        const headerByTestId = await screen.findAllByTestId("default-header-id");
        expect(headerByTestId).toHaveLength(1);
        const photoCardGridByTestId = await screen.findAllByTestId("photo-card-grid-left-public-id");
        expect(photoCardGridByTestId).toHaveLength(1);
        screen.debug();
    });
})
