import React, { useState } from "react";

import {
    Box,
    Button,
    Group,
    PasswordInput,
    Space,
    Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useFocusTrap } from "@mantine/hooks";
import { IconLock } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { changePassword } from "../services/auth";
import { extractMessageFromRestError } from "../utils";

const UpdatePasswordForm: React.FC<{onPasswordChange: () => void}> = (props) => {

    const [error, setError] = useState<string | null>(null);
    const focusTrapChangePasswordRef = useFocusTrap();
  
  
    const changePasswordMutation = useMutation({
      mutationFn: changePassword,
      onSuccess: () => {
          console.log("UpdatePasswordForm.changePasswordMutation() - success");
          props.onPasswordChange();
      },
      onError: (error: Error | AxiosError) => {
          console.log("UpdatePasswordForm.changePasswordMutation() - got an error: ");
          console.log(error);
          setError("Change user password failed with '"+ extractMessageFromRestError(error) +"'");
      }
  
    });   
    
    const passwordChangeForm = useForm({
        initialValues: {
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        },
        validate: {
          currentPassword: (value) => (value.length < 2 ? "Current password required" : null),
          newPassword: (value) => (value.length < 2 ? "New password required" : null),
          confirmNewPassword: (value, values) => (value !== values.newPassword ? "New passwords do not match" : null),
        }
    });  

    const passwordChangeSubmitHandler = async (event: React.FormEvent) => {
        console.log("UpdatePasswordForm.passwordChangeSubmitHandler()");
        event.preventDefault();
        setError(null);
        
        const validation = passwordChangeForm.validate();
        console.log("UpdatePasswordForm.passwordChangeSubmitHandler() - validation results :");
        console.log(validation);
        if (validation.hasErrors){
          return;
        }
    
        changePasswordMutation.mutate({
          originalPassword: passwordChangeForm.values.currentPassword,
          newPassword: passwordChangeForm.values.newPassword
        });
    
    };

    const content = (
        <form onSubmit={passwordChangeSubmitHandler} ref={focusTrapChangePasswordRef}>
          <PasswordInput
            data-autofocus
            withAsterisk
            label="Current Password"
            placeholder="Current password"
            leftSection={<IconLock size="1.1rem" />}
            {...passwordChangeForm.getInputProps("currentPassword")}
          />
          <Space h="xs"/>
          <PasswordInput
            withAsterisk
            label="New Password"
            placeholder="New password"
            leftSection={<IconLock size="1.1rem" />}
            {...passwordChangeForm.getInputProps("newPassword")}
          />
          <Space h="xs"/>
          <PasswordInput
            withAsterisk
            label="Confirm New Password"
            placeholder="Confirm new password"
            leftSection={<IconLock size="1.1rem" />}
            {...passwordChangeForm.getInputProps("confirmNewPassword")}
          />
          <Space h="sm"/>
          <Group justify="center">
            <Button type="submit">Update</Button>
          </Group>
        </form>
    );

    return (
        <>
          <Box w={330} >
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

export default UpdatePasswordForm;
