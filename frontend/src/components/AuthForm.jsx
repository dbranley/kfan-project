import React, { useContext, useRef, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Checkbox,
  Group,
  PasswordInput,
  Text,
  TextInput,
  FocusTrap, 
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useFocusTrap } from "@mantine/hooks";
import { IconAt, IconLock, IconUser } from "@tabler/icons-react";

import { login, register } from "../services/auth";
// import AuthContext from "../store/auth-context";
import { validateEmail } from "../utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// import classes from "./UploadForm.module.css";

const AuthForm = (props) => {
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [underlined, setUnderlined] = useState("");
  const focusTrapRef = useFocusTrap();
  const focusTrapLoginRef = useFocusTrap();
  const focusTrapRegisterRef = useFocusTrap();


  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries(["currentUser"]);
      queryClient.invalidateQueries(["photoCards"]);
      props.onLogin();
    }, 
    onError: (error) => {
      console.log("AuthForm.loginMutation() - got error during login");
      console.log(error);
      setError("Login failed with '" + error.message + "'");
    }
  });  

  const registerUserMutation = useMutation({
    mutationFn: register,
    onSuccess: (data, variables, context) => {
        props.onRegister();
    },
    onError: (error) => {
        console.log("AuthForm.registerUserMutation() - got an error: ");
        console.log(error);
        setError("Register new user failed with '"+error.response.data.detail+"'");
    }

  });



  // const authCtx = useContext(AuthContext);

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

  const registerSubmitHandler = async (event) => {
    console.log("AuthForm.registerSubmitHandler()");
    event.preventDefault();
    setError(null);
    
    const validation = registerForm.validate();
    console.log("AuthForm.registerSubmitHandler()");
    console.log(validation);
    if (validation.hasErrors){
      return;
    }

    console.log("AuthForm.registerSubmitHandler() - registerForm.values is:");
    console.log(registerForm.values);    

    //TODO -- hook up react query mutation here
    registerUserMutation.mutate({
      username: registerForm.values.username,
      email: registerForm.values.email,
      password: registerForm.values.password
    });

  };

  const loginSubmitHandler = async (event) => {
    console.log("AuthForm.loginSubmitHandler()");

    event.preventDefault();
    setError(null);

    const validation = loginForm.validate();
    console.log("AuthForm.loginSubmitHandler() - isValid:");
    console.log(validation);
    if (validation.hasErrors) {
      return;
    }

    console.log("AuthForm.loginSubmitHandler() - form.values is:");
    console.log(loginForm.values);

    const enteredUserNameValue = loginForm.values.username;
    const enteredPasswordValue = loginForm.values.password;

    //do I need 'await' here??
    loginMutation.mutate({
      username: enteredUserNameValue, 
      password: enteredPasswordValue
    });
    // try {
    //   await authCtx.onLogin(enteredUserNameValue, enteredPasswordValue);
    //   console.log(
    //     "AuthForm.loginSubmitHandler() - after authCtx.onLogin() call"
    //   );
    //   props.onLogin();
    // } catch (error) {
    //   console.log("AuthForm.loginSubmitHandler() - exception during login");
    //   setError("Login failed with '" + error.message + "'");
    // }
  };

  let content = "";

  if (showLogin) {
    content = (
      <form data-testid="auth-form-id" onSubmit={loginSubmitHandler} ref={focusTrapLoginRef} >
        <TextInput
          data-autofocus
          withAsterisk
          label="Username"
          placeholder="Your username"
          icon={<IconUser size="1.1rem" />}
          {...loginForm.getInputProps("username")}
        />
        <PasswordInput
          withAsterisk
          label="Password"
          placeholder="Password"
          icon={<IconLock size="1.1rem" />}
          {...loginForm.getInputProps("password")}
        />
        {/* <Checkbox
          mt="md"
          label="I agree to sell my privacy"
          {...loginForm.getInputProps("termsOfService", { type: "checkbox" })}
        /> */}
        <Group position="apart" mt="md" spacing="sm">
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
          icon={<IconUser size="1.1rem" />}
          {...registerForm.getInputProps("username")}
        />
        <TextInput
          withAsterisk
          label="Email"
          placeholder="Your email"
          icon={<IconAt size="1.1rem" />}
          {...registerForm.getInputProps("email")}
        />
        <PasswordInput
          withAsterisk
          label="Password"
          placeholder="Password"
          icon={<IconLock size="1.1rem" />}
          {...registerForm.getInputProps("password")}
        />
        <PasswordInput
          withAsterisk
          label="Confirm Password"
          placeholder="Confirm password"
          icon={<IconLock size="1.1rem" />}
          {...registerForm.getInputProps("confirmPassword")}
        />
        <Checkbox
          mt="md"
          label="I agree to sell my privacy"
          {...registerForm.getInputProps("termsOfService", { type: "checkbox" })}
        />
        <Group position="apart" mt="md" spacing="sm">
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
    // <form className={classes.form} onSubmit={submitHandler}>
    <>
      <Box maw={300} mx="auto">
        {content}
        {/* <form onSubmit={submitHandler}>
          <TextInput
            withAsterisk
            label="Username"
            placeholder="Your email"
            icon={<IconAt size="1rem"/>}
            {...form.getInputProps("username")}
          />
          <PasswordInput
            withAsterisk
            label="Password"
            placeholder="Password"
            icon={<IconLock size="1.1rem"/>}
            {...form.getInputProps("password")}
          />
          <Checkbox 
            mt="md"
            label="I agree to sell my privacy"
            {...form.getInputProps('termsOfService', {type: 'checkbox'})}
          />
          <Group position="apart" mt="md" spacing="sm">
            <Text color="gray" size="sm">Don&apos;t have an account? Register</Text>
            <Button type="submit">Login</Button>
          </Group>
        </form> */}
      </Box>
      {error != null && (
        <div>
          <Text size="sm" color="red" align="center">
            {error}
          </Text>
        </div>
      )}
    </>
  );
};

AuthForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
};

export default AuthForm;
