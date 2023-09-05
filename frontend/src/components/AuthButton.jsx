import React, { useEffect } from "react";
import { Avatar, Button, Container, Group, Menu, Modal, Space, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import AuthForm from "./AuthForm";
import UpdatePasswordForm from "./UpdatePasswordForm";

import { getCurrentUser, logout, SESSION_EXPIRATION_TIME } from "../services/auth";

export default function AuthButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false);

  const [successOpened, { open: successOpen, close: successClose }] =
    useDisclosure(false);

  const [successChangeOpened, { open: successChangeOpen, close: successChangeClose }] =
    useDisclosure(false);

  const navigate = useNavigate();
  const location = useLocation();

  // const authCtx = useContext(AuthContext);

  const queryClient = useQueryClient();

  const currentUserQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: SESSION_EXPIRATION_TIME
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
      queryClient.invalidateQueries(["photoCards"]);
    }, 
    onError: (error) => {
      console.log("AuthButton.logoutMutation() - got error: ");
      console.log(error);
      //do something here!!
    }
  });

  useEffect(() => {
    if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id === 0){
      if (location.pathname !== "/"){
        console.log("AuthButton - useEffect() query status - not logged in and pathname not / so call navigate()");
        navigate("/");
      }
    }
  }, [currentUserQuery.data]);

  console.log("AuthButton() - settingsOpened:");
  console.log(settingsOpened);
  console.log("AuthButton() - successChangeOpened:");
  console.log(successChangeOpened);

  let content = "";
  if (!successChangeOpened && settingsOpened) {
    console.log("AuthButton - in else-if-block for settings modal to be displayed");
    content = (
      <div>
        <Modal size="auto" xOffset={-100} opened={settingsOpened} onClose={closeSettings} title="Change Password">
          <UpdatePasswordForm onPasswordChange={successChangeOpen} />
        </Modal>   
        <Avatar data-testid="profile-avatar-id" radius="xl" size="sm" variant="filled" color="orange" style={{cursor:"pointer"}} />       
      </div>
    );  

  } else if (successChangeOpened && settingsOpened) {
    console.log("AuthButton - in else-if-block for password change success");
    content = (
      <div>
        <Modal size="auto" xOffset={-100} opened={settingsOpened} onClose={closeSettings} title="Change Password" >
          <Container >
            <Text align="center">Password successfully changed</Text>
            <Space h="sm"/>
            <Group position="center">
              <Button onClick={() => {
                    closeSettings();
                    successChangeClose();
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
    console.log("AuthButton - in if-block where about to create logout button");
    content = (
      <Menu trigger="hover" openDelay={100}>
        <Menu.Target>
          <Avatar data-testid="profile-avatar-id" radius="xl" size="sm" variant="filled" color="orange" style={{cursor:"pointer"}} />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>@{currentUserQuery.data.username}</Menu.Label>
          <Menu.Item onClick={()=>{
            console.log("AuthButton - clicked Settings menu item");
            openSettings();
            }}>Settings</Menu.Item>
          <Menu.Item data-testid="logout-button-id" size="xs" onClick={()=>{
            logoutMutation.mutate();
            navigate("/");
          }}>Logout</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    //   <Button data-testid="logout-button-id" size="xs" onClick={()=>{
    //     logoutMutation.mutate();
    //     navigate("/");
    //   }}>
    //   Logout
    // </Button>
    );
  } else if (successOpened && opened) {
    console.log("AuthButton - in else-if-block where about to create login modal");
    content = (
      <div>
        <Modal size="auto" xOffset={-100} opened={opened} onClose={close} title="Authentication" >
          <Container >
            <Text align="center">New user successfully created</Text>
            <Group position="apart" mt="md">
              <Button onClick={() => {
                  close();
                  successClose();
                }}
              >
                Close
              </Button>
              <Button onClick={() => {
                  successClose();
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

  } else {
    //Note: we will get to this else block if status is 'loading' - that's ok because we assume this state
    console.log("AuthButton - in else-block where about to create login button");
    content = (
      <div>
        <Modal size="auto" xOffset={-100} opened={opened} onClose={close} title="Authentication">
          <AuthForm onLogin={close} onRegister={successOpen} />
        </Modal>
        <Button data-testid="login-button-id" size="xs" onClick={open}>
          Login
        </Button>
      </div>
    );
  }

  return <>{content}</>;
}
