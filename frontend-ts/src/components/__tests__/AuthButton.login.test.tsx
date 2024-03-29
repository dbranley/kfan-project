import { ReactNode } from "react";
import { it, describe, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
            retry: false,
        }
    }
});

const queryProvider = ({ children }: Props) => (
    <QueryClientProvider client={queryClient}>
        <MantineProvider>
            <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
            {/* <Router location={history.location} navigator={}>
                {children}
            </Router> */}
        </MantineProvider>
    </QueryClientProvider>
);

vi.mock('../../services/auth.ts', async () => {
    return {
        getCurrentUser: vi.fn().mockReturnValue({email: "unknown", id: 0, username: "unknown"}),
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

describe("AuthButton tests when not logged in", () => {
    afterEach(()=>{
        vi.restoreAllMocks();
    });

    it("Make sure Login text appears on button when not logged in", async () => {

        render(<AuthButton/>, { wrapper: queryProvider });
        // render(
        //     <QueryClientProvider client={queryClient}>
        //         <Router location={history.location}>
        //             <AuthButton/>
        //         </Router>
        //     </QueryClientProvider>
        // );
        const loginButtonByTestId = await screen.findAllByTestId("login-button-id")

        console.log("AuthButton test1 - about to print loginButtonByTestId");
        console.log(loginButtonByTestId);
        expect(loginButtonByTestId).toHaveLength(1); 
        // expect(logoutButtonByTestId).toHaveLength(0);   

        screen.debug();
    });

    it("Make sure Login modal appears when login button pressed", async () => {

        const user = userEvent.setup();

        render(<AuthButton/>, { wrapper: queryProvider });
        // render(
        //     <QueryClientProvider client={queryClient}>
        //         <Router location={history.location}>
        //             <AuthButton/>
        //         </Router>
        //     </QueryClientProvider>
        // );
        const loginButtonByTestId = screen.queryAllByTestId("login-button-id");

        console.log("AuthButton test2 - about to print loginButtonByTestId");
        console.log(loginButtonByTestId);
        expect(loginButtonByTestId).toHaveLength(1); 
        screen.debug();

        //now click the login button
        console.log("AuthButton test2 - about to 'push' loginButtonByTestId");
        loginButtonByTestId.push();
        await user.click(loginButtonByTestId[0]);
        const authFormByTestId = screen.queryAllByTestId("auth-form-id");
        expect(authFormByTestId).toHaveLength(1); 
        console.log("AuthButton test2 - about to print authFormByTestId");
        console.log(authFormByTestId);

        screen.debug();

    });    
})