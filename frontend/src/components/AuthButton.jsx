import React, { useContext, useState } from "react";
import { Button, Container, Group, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import axios from "axios";

// import AuthContext from "../store/auth-context";
import AuthForm from "./AuthForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";

import { getCurrentUser, logout, SESSION_EXPIRATION_TIME } from "../services/auth";

export default function AuthButton() {
  const [opened, { open, close }] = useDisclosure(false);

  const [successOpened, { open: successOpen, close: successClose }] =
    useDisclosure(false);

  const navigate = useNavigate();
  const location = useLocation();
  console.log("AuthButton() - about to print location.pathname: ")
  console.log(location.pathname);



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

  // console.log("AuthButton.after useQuery() definition - currentUserQuery is:")
  // console.log(currentUserQuery);  
  // console.log("AuthButton.after useQuery() definition - currentUserQuery.status is:")
  // console.log(currentUserQuery.status);
  // if (currentUserQuery.status === "success"){
  //   console.log("AuthButton.after useQuery() definition - currentUserQuery.data is:")
  //   console.log(currentUserQuery.data);
  //   console.log("AuthButton.after useQuery() definition - currentUserQuery.data.id is:")
  //   console.log(currentUserQuery.data.id);
  // }



  let content = "";
  if (currentUserQuery.status === "success" && currentUserQuery.data !== null && currentUserQuery.data.id !== 0) {
    console.log("AuthButton - in if-block where about to create logout button");
    content = (
      // <Button size="xs" onClick={authCtx.onLogout}>
      <Button data-testid="logout-button-id" size="xs" onClick={()=>{
          logoutMutation.mutate();
          navigate("/");
        }}>
        Logout
      </Button>
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
  // console.log("AuthButton() - before return - 'content' is:");
  // console.log(content);
  // console.log("AuthButton() - before return - after printing 'content'");

  return <>{content}</>;
}
