import React, { useEffect, useState } from 'react';
import { Avatar, Button, Container, Group, Menu, Modal, Space, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import { getCurrentUser, SESSION_EXPIRATION_TIME, logout } from "../services/auth";
import AuthForm from './AuthForm';

export default function AuthButton() {

    const [opened, { open, close }] = useDisclosure(false);
    const [menuOpened, setMenuOpened] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const queryClient = useQueryClient();


    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME
    });

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["currentUser"]});
        //   queryClient.invalidateQueries(["photoCards"]);
        }, 
        onError: (error) => {
          console.log("AuthButton.logoutMutation() - got error: ");
          console.log(error);
          //do something here!!
        }
    });

    useEffect(() =>{
        console.log("AuthButton() - useEffect() - at top");
        if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id === 0){
            console.log("AuthButton() - useEffect() - no one logged in now...");
            console.log(currentUserQuery.data);
            console.log("AuthButton - useEffect() - location.pathname is:");
            console.log(location.pathname);            
            if (location.pathname !== "/"){
                console.log("AuthButton - useEffect() - about to call navigate()");
                navigate("/");
            }
        }

    });
    // }, [currentUserQuery.data]);

    let content = <></>

    //building out this if-block incrementally as I port code over from reg react

    if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id !== 0) {
        console.log("AuthButton - seems like someone is logged in, so show avatar");

        content = (
            <Menu opened={menuOpened} onChange={setMenuOpened} openDelay={100}>
                <Menu.Target>
                    <Avatar data-testid="profile-avatar-id" radius="xl" size="sm" variant="filled" color="orange" style={{cursor:"pointer"}} />
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>@{currentUserQuery.data.username}</Menu.Label>
                    <Menu.Item>Profile</Menu.Item>
                    <Menu.Item>Settings</Menu.Item>
                    <Menu.Item data-testid="logout-button-id" size="xs" onClick={()=>{
                        logoutMutation.mutate();
                        navigate("/");
                    }}>Logout</Menu.Item>
                </Menu.Dropdown>
            </Menu>
        );
    
    } else if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id === 0){
        console.log("AuthButton - about to create login button");
        content = (
            <div>
                <Modal size="auto" xOffset={-100} opened={opened} onClose={close} title="Authentication">
                    <AuthForm onLogin={close}/>
                </Modal>
                <Button data-testid="login-button-id" size="xs" onClick={open}>
                    Login
                </Button>
            </div>
        );
    }

    return <>{content}</>;

}
