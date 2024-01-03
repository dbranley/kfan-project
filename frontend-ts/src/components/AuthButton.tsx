import { useState } from 'react';
import { Avatar, Button, Container, Group, Menu, Modal, Space, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, SESSION_EXPIRATION_TIME, logout } from "../services/auth";
import AuthForm from './AuthForm';
import UpdatePasswordForm from './UpdatePasswordForm';

export default function AuthButton() {

    const [opened, { open, close }] = useDisclosure(false);
    const [menuOpened, setMenuOpened] = useState(false);
    const [registerSuccessOpened, { open: registerSuccessOpen, close: registerSuccessClose }] =
    useDisclosure(false);
    const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);
    const [pwdChangeSuccessOpened, { open: pwdChangeSuccessOpen, close: pwdChangeSuccessClose }] =
    useDisclosure(false);

    const navigate = useNavigate();

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
          queryClient.invalidateQueries({ queryKey: ["photoCards"]});
        //   queryClient.invalidateQueries(["photoCards"]);
        }, 
        onError: (error) => {
          console.log("AuthButton.logoutMutation() - got error: ");
          console.log(error);
          //do something here!!
        }
    });

    // useEffect(() =>{
    //     console.log("AuthButton() - useEffect() - at top");
    //     if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id === 0){
    //         console.log("AuthButton() - useEffect() - no one logged in now...");
    //         console.log(currentUserQuery.data);
    //         console.log("AuthButton - useEffect() - location.pathname is:");
    //         console.log(location.pathname);            
    //         if (location.pathname !== "/"){
    //             console.log("AuthButton - useEffect() - about to call navigate()");
    //             navigate("/");
    //         }
    //     }

    // }, [currentUserQuery.status, currentUserQuery.data, location.pathname, navigate]);
    // }, [currentUserQuery.data]);

    let content = <></>

    //building out this if-block incrementally as I port code over from reg react

    if (!pwdChangeSuccessOpened && settingsOpened) {
        console.log("AuthButton - in else-if-block for settings modal to be displayed");
        content = (
          <div>
            <Modal size="auto" xOffset={-100} opened={settingsOpened} onClose={closeSettings} title="Change Password">
              <UpdatePasswordForm onPasswordChange={pwdChangeSuccessOpen} />
            </Modal>   
            <Avatar data-testid="profile-avatar-id" radius="xl" size="sm" variant="filled" color="orange" style={{cursor:"pointer"}} />       
          </div>
        ); 
    } else if (pwdChangeSuccessOpened && settingsOpened) {
        console.log("AuthButton - in else-if-block for password change success");
        content = (
          <div>
            <Modal size="auto" xOffset={-100} opened={settingsOpened} onClose={closeSettings} title="Change Password" >
              <Container >
                <Text ta="center">Password successfully changed</Text>
                <Space h="sm"/>
                <Group justify="center">
                  <Button onClick={() => {
                        closeSettings();
                        pwdChangeSuccessClose();
                      }}
                  >
                    Close
                  </Button>
                </Group>
              </Container>
            </Modal>
            <Avatar data-testid="profile-avatar-id" radius="xl" size="sm" variant="filled" color="orange" style={{cursor:"pointer"}} />
          </div>
        );        

    } else if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id !== 0) {
        console.log("AuthButton - seems like someone is logged in, so show avatar");

        content = (
            <Menu opened={menuOpened} onChange={setMenuOpened} openDelay={100}>
                <Menu.Target>
                    <Avatar data-testid="profile-avatar-id" radius="xl" size="sm" variant="filled" color="orange" style={{cursor:"pointer"}} />
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>@{currentUserQuery.data.username}</Menu.Label>
                    <Menu.Item  onClick={()=>{
                      navigate("/profile/"+currentUserQuery.data.username);
                    }} >Profile</Menu.Item>
                    <Menu.Item onClick={()=>{
                        console.log("AuthButton - clicked Settings menu item");
                        openSettings();
                    }}>Settings</Menu.Item>
                    <Menu.Item data-testid="logout-button-id" onClick={()=>{
                        logoutMutation.mutate();
                        navigate("/");
                    }}>Logout</Menu.Item>
                </Menu.Dropdown>
            </Menu>
        );
    
    } else if (registerSuccessOpened && opened){
        console.log("AuthButton - registration was successful, show success message");
        content = (
            <div>
            <Modal size="auto" xOffset={-100} opened={opened} onClose={close} title="Authentication" >
              <Container >
                <Text ta="center">New user successfully created</Text>
                <Group justify="space-between" mt="md">
                  <Button onClick={() => {
                      close();
                      registerSuccessClose();
                    }}
                  >
                    Close
                  </Button>
                  <Button onClick={() => {
                      registerSuccessClose();
                      open();
                    }}
                  >
                    Login
                  </Button>
                </Group>
              </Container>
            </Modal>
            <Button size="xs" onClick={open}>
              Login
            </Button>        
          </div>
    
        );
    } else if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id === 0){
        console.log("AuthButton - about to create login button");
        content = (
            <>
                <Modal size="auto" xOffset={-100} opened={opened} onClose={close} title="Authentication">
                    <AuthForm onLogin={close} onRegister={registerSuccessOpen}/>
                </Modal>
                <Button data-testid="login-button-id" size="xs" onClick={open}>
                    Login
                </Button>
            </>
        );
    }

    return <>{content}</>;

}
