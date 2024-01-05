import React, { useState } from "react";
import {
    Box,
    Button,
    Checkbox,
    Group,
    PasswordInput,
    Text,
    TextInput,
  } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useFocusTrap } from "@mantine/hooks";
import { IconAt, IconLock, IconUser } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { login, register } from "../services/auth";
import { extractMessageFromRestError, validateEmail } from "../utils";

const AuthForm: React.FC<{onLogin: () => void, onRegister: () => void}> = (props) => {

    const [error, setError] = useState<string | null>(null);
    const [showLogin, setShowLogin] = useState(true);
    const [underlined, setUnderlined] = useState("");
    const focusTrapLoginRef = useFocusTrap();
    const focusTrapRegisterRef = useFocusTrap();

    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["currentUser"]});
          // queryClient.invalidateQueries({ queryKey: ["photoCards"]});
          props.onLogin();
          console.log("AuthForm.loginMutation() - onSuccess");
        }, 
        onError: (error: Error | AxiosError) => {
          console.log("AuthForm.loginMutation() - got error during login");
          console.log(error);
          setError("Login failed with '" + extractMessageFromRestError(error) + "'");
        }
    });

    const registerUserMutation = useMutation({
        mutationFn: register,
        onSuccess: () => {
            props.onRegister();
        },
        onError: (error: Error | AxiosError) => {
            console.log("AuthForm.registerUserMutation() - got an error: ");
            console.log(error);
            setError("Register new user failed with '"+extractMessageFromRestError(error)+"'");
        }
    
    });

    const loginForm = useForm({
        initialValues: {
          username: "",
          password: "",
          // termsOfService: true,
        },
        validate: {
          username: (value) => (value.length < 2 ? "Username required" : null),
          password: (value) => (value.length < 2 ? "Password required" : null),
          // termsOfService: (value) => (value === false ? "Must accept terms" : null),
        },
    });

    const registerForm = useForm({
        initialValues: {
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          termsOfService: false
        },
        validate: {
          username: (value) => (value.length < 2 ? "Username required" : null),
          email: (value) => (validateEmail(value) === false ? "Valid email required" : null),
          password: (value) => (value.length < 2 ? "Password required" : null),
          confirmPassword: (value, values) => (value !== values.password ? "Passwords do not match" : null),
          termsOfService: (value) => (value === false ? "Must accept terms" : null),
        }
    
    });

    const loginSubmitHandler = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        const validation = loginForm.validate();
        if (validation.hasErrors){
            return;
        }

        const enteredUserNameValue = loginForm.values.username.toLowerCase();
        const enteredPasswordValue = loginForm.values.password;
    
        //do I need 'await' here??
        loginMutation.mutate({
          username: enteredUserNameValue, 
          password: enteredPasswordValue
        });        
    };

    const registerSubmitHandler = async (event: React.FormEvent) => {
        console.log("AuthForm.registerSubmitHandler()");
        event.preventDefault();
        setError(null);
        
        const validation = registerForm.validate();
        console.log("AuthForm.registerSubmitHandler()");
        console.log(validation);
        if (validation.hasErrors){
          return;
        }
    
        registerUserMutation.mutate({
          username: registerForm.values.username.toLowerCase(),
          email: registerForm.values.email,
          password: registerForm.values.password
        });
    
      };

    let content = <></>;

    if (showLogin){
        content = (
            <form data-testid="auth-form-id" onSubmit={loginSubmitHandler} ref={focusTrapLoginRef} >
                <TextInput
                    data-autofocus
                    withAsterisk
                    label="Username"
                    placeholder="Your username"
                    leftSection={<IconUser size="1.1rem" />}
                    {...loginForm.getInputProps("username")}
                />
                <PasswordInput
                    withAsterisk
                    label="Password"
                    placeholder="Password"
                    leftSection={<IconLock size="1.1rem" />}
                    {...loginForm.getInputProps("password")}
                />
                <Group justify="space-between" mt="md" gap="sm">
                    <Text
                        style={{ cursor: "pointer" }}
                        color="gray"
                        size="sm"
                        td={underlined}
                        onMouseEnter={() => {
                            setUnderlined("underline");
                        }}
                        onMouseLeave={() => {
                            setUnderlined("");
                        }}
                        onClick={() => {
                            setShowLogin(false);
                        }}
                    >
                        Don&apos;t have an account? Register
                    </Text>
                    <Button type="submit">Login</Button>
                </Group>
          </form>    
        );
    } else {
        content = (
          <form onSubmit={registerSubmitHandler} ref={focusTrapRegisterRef}>
            <TextInput
              withAsterisk
              label="Username"
              placeholder="Your username"
              leftSection={<IconUser size="1.1rem" />}
              {...registerForm.getInputProps("username")}
            />
            <TextInput
              withAsterisk
              label="Email"
              placeholder="Your email"
              leftSection={<IconAt size="1.1rem" />}
              {...registerForm.getInputProps("email")}
            />
            <PasswordInput
              withAsterisk
              label="Password"
              placeholder="Password"
              leftSection={<IconLock size="1.1rem" />}
              {...registerForm.getInputProps("password")}
            />
            <PasswordInput
              withAsterisk
              label="Confirm Password"
              placeholder="Confirm password"
              leftSection={<IconLock size="1.1rem" />}
              {...registerForm.getInputProps("confirmPassword")}
            />
            <Checkbox
              mt="md"
              label="I agree to sell my privacy"
              {...registerForm.getInputProps("termsOfService", { type: "checkbox" })}
            />
            <Group justify="space-between" mt="md" gap="sm">
              <Text
                style={{ cursor: "pointer" }}
                color="gray"
                size="sm"
                td={underlined}
                onMouseEnter={() => {
                  setUnderlined("underline");
                }}
                onMouseLeave={() => {
                  setUnderlined("");
                }}
                onClick={() => {
                  setShowLogin(true);
                }}
              >
                Have an account? Login
              </Text>
              <Button type="submit">Register</Button>
            </Group>
          </form>
        );
    }

    return (
        <>
            <Box w={330} mx="auto">
                {content}
            </Box>
            {error != null && (
            <div>
            <Text size="sm" c="red" ta="center">
                {error}
            </Text>
            </div>
      )}            
        </>
    );
};

export default AuthForm;