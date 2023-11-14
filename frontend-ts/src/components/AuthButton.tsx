import React, { useEffect } from 'react';
import { Avatar, Button, Container, Group, Menu, Modal, Space, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCurrentUser, SESSION_EXPIRATION_TIME } from "../services/auth";

export default function AuthButton() {


    const queryClient = useQueryClient();


    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME
    });

    useEffect(() =>{
        console.log("AuthButton() - useEffect() - at top");
        if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id === 0){
            console.log("AuthButton() - useEffect() - no one logged in now...");
            console.log(currentUserQuery.data);
        }

    });
    // }, [currentUserQuery.data]);

    let content = <></>

    //eventually this will be end of long if-block
    //but for now it is the only possible condition until I port more code
    if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id === 0){
        console.log("AuthButton - about to create login button");
        content = (
            <div>
                <Button data-testid="login-button-id" size="xs">
                    Login
                </Button>
            </div>
        );
    }

    return <>{content}</>;

}
