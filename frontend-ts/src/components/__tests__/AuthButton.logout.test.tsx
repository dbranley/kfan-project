import React from "react";
import { it, describe, expect, vi, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Route, Router, Routes, MemoryRouter } from "react-router-dom";
import { createMemoryHistory } from 'history'

import AuthButton from "../AuthButton";
import { MantineProvider } from "@mantine/core";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: true,
        }
    }
});

const history = createMemoryHistory();

const TestHello = () => <h1>Hello Tesing World</h1>;

const queryProvider = ({ children }) => (
    <QueryClientProvider client={queryClient}>
        <MantineProvider>
            <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>    
        </MantineProvider>
        {/* <Router location={history.location}>
            {children}
        </Router> */}
    </QueryClientProvider>
);


vi.mock('../../services/auth.ts', async () => {
    return {
        getCurrentUser: vi.fn().mockReturnValue( {email: "testuser@email.com", id: 1, username: "testuser"} ),
        SESSION_EXPIRATION_TIME: 900000,
        logout: vi.fn(),
        login: vi.fn(),
        register: vi.fn(),
    }
});

window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        addEventListener: function() {},
        removeEventListener: function() {}, 
        removeListener: function() {},
        scrollTo: function() {}
    }
}

describe("AuthButton tests when already logged in", () => {
    afterEach(()=>{
        vi.restoreAllMocks();
    });

    it("Make sure Logout text appears on button when not logged in", async () => {

        render(<AuthButton/>, { wrapper: queryProvider });
        // render(
        //     <QueryClientProvider client={queryClient}>
        //         <Router location={history.location}>
        //             <AuthButton/>
        //         </Router>
        //     </QueryClientProvider>
        // );
        const profileAvatarId = await screen.findAllByTestId("profile-avatar-id")
        expect(profileAvatarId).toHaveLength(1); 
        // const logoutButtonByTestId = await screen.findAllByTestId("logout-button-id")
        // expect(logoutButtonByTestId).toHaveLength(1);   
        screen.debug();
    });
  
})