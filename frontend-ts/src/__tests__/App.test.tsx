import React from "react";
import { it, describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
        getPhotoCards: vi.fn().mockReturnValue([
                {   
                    back_file_name: "f89d4997742f4f9cb8dfc94feaff6b4b_back.png",
                    card_name: "Rock Again",
                    favorite_cnt: 0,
                    favorite_id: null,
                    front_file_name: "f89d4997742f4f9cb8dfc94feaff6b4b_front.png",
                    group_name: "More Rock",
                    id: 59,
                    owner_name: "gerard",
                    share: true,
                    source_name: "t-shirt",
                    source_type: "merch"
                },
                {   
                    back_file_name: "f89d4997742f4f9cb8dfc94feaff6b4b_back.png",
                    card_name: "Rock Again22",
                    favorite_cnt: 0,
                    favorite_id: null,
                    front_file_name: "f89d4997742f4f9cb8dfc94feaff6b4b_front.png",
                    group_name: "More Rock22",
                    id: 22,
                    owner_name: "gerard",
                    share: true,
                    source_name: "t-shirt",
                    source_type: "merch"
                }                          
        ]), //([]),
        getPhotoCard: vi.fn(),
        addPhotoCard: vi.fn(),
        deletePhotoCard: vi.fn(),
        addPhotoCardFavorite: vi.fn(),
        removePhotoCardFavorite: vi.fn(),
        updatePhotoCard: vi.fn(), 
    }
});
// vi.mock('../services/photo-cards.ts', async () => {
//     return {
//         getPhotoCards: vi.fn().mockReturnValue(mockPhotoCardQueryResult), //([]),
//         getPhotoCard: vi.fn(),
//         addPhotoCard: vi.fn(),
//         deletePhotoCard: vi.fn(),
//         addPhotoCardFavorite: vi.fn(),
//         removePhotoCardFavorite: vi.fn(),
//         updatePhotoCard: vi.fn(), 
//     }
// });
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        addEventListener: function() {},
        removeEventListener: function() {}, 
        removeListener: function() {},
        scrollTo: function() {},
    }
}

describe("App.tsx", () => {
    it("First test in project, make sure App renders fine", async () => {
        render(<App/>, { wrapper: queryProvider });
        // render(<QueryClientProvider client={queryClient}><App/></QueryClientProvider>);
        const headerByTestId = await screen.findAllByTestId("default-header-id");
        expect(headerByTestId).toHaveLength(1);
        //screen.debug();
        // const photoCardGridByTestId = await screen.findAllByTestId("photo-card-grid-left-public-id");
        const photoCardGridTopByTestId = await screen.findAllByTestId("photo-card-grid-at-top");
        expect(photoCardGridTopByTestId).toHaveLength(1);
        const photoCardGridPublicByTestId = await screen.findAllByTestId("photo-card-grid-center-public-id");
        expect(photoCardGridPublicByTestId).toHaveLength(1);
        // screen.debug(undefined, 300000);
    });
})
