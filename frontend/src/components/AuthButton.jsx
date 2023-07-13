import React, { useContext, useState } from "react";
import { Button, Container, Group, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import axios from "axios";

// import AuthContext from "../store/auth-context";
import AuthForm from "./AuthForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, logout, SESSION_EXPIRATION_TIME } from "../services/auth";

export default function AuthButton() {
  const [opened, { open, close }] = useDisclosure(false);

  const [successOpened, { open: successOpen, close: successClose }] =
    useDisclosure(false);

  const navigate = useNavigate();

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

  // if (currentUserQuery.status === "loading"){
  //   //this is just a placeholder for now... TODO 
  //   return <div>Loading...</div>;
  // }

  console.log("AuthButton.after useQuery() definition - currentUserQuery.status is:")
  console.log(currentUserQuery.status);
  console.log("AuthButton.after useQuery() definition - currentUserQuery.data is:")
  console.log(currentUserQuery.data);
  // console.log("AuthButton.after useQuery() definition - currentUserQuery.data.username is:")
  // console.log(currentUserQuery.data.username);


  let content = "";
  // if (authCtx.isLoggedIn) {
  if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id !== 0) {
    content = (
      // <Button size="xs" onClick={authCtx.onLogout}>
      <Button size="xs" onClick={()=>{
          logoutMutation.mutate();
          navigate("/");
        }}>
        Logout
      </Button>
    );
  } else if (successOpened && opened) {
    content = (
      <div>
        <Modal opened={opened} onClose={close} title="Authentication">
          <Container>
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
    content = (
      <div>
        <Modal opened={opened} onClose={close} title="Authentication">
          <AuthForm onLogin={close} onRegister={successOpen} />
        </Modal>
        <Button size="xs" onClick={open}>
          Login
        </Button>
      </div>
    );
  }
  console.log("AuthButton() - before return - content is:");
  console.log(content);

  return <>{content}</>;
}
