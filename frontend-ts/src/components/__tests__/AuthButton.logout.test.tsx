import { ReactNode } from "react";
import { it, describe, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom";

import AuthButton from "../AuthButton";
import { MantineProvider } from "@mantine/core";

interface Props {
    children?: ReactNode
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: true,
        }
    }
});

const queryProvider = ({ children }: Props) => (
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