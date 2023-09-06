import React, { useRef, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { IconUpload } from "@tabler/icons-react";

import { Box, Button, Checkbox, Container, FileInput, Group, Modal, Text, TextInput, LoadingOverlay, FocusTrap } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "react-router-dom";

import { addPhotoCard } from "../services/photo-cards";
import { extractMessageFromRestError } from "../utils";

const UploadForm = () => {

    const [error, setError] = useState(null);
    const [uploadSuccessful, setUploadSuccessful] = useState(false);

    const [successOpened, {open, close}] = useDisclosure(false);
    const [visible, { toggle, open: openLoader, close: closeLoader }] = useDisclosure(false);

    const form = useForm({
        initialValues: {
            frontfile: null,
            backfile: null,
            groupname: '',
            cardname: '',
            share: false,
        },
        validate: {
            frontfile: (value) => ((value === null || value === undefined) ? 'Front photo required': null),
            backfile: (value) => ((value === null || value === undefined) ? 'Back photo required': null),
            groupname: (value) => (value.length <1 ? 'Group name required': null),
            cardname: (value) => (value.length <1 || value.length > 100? 'Card name required and not longer than 100 characters': null)
        }
    });


    const queryClient = useQueryClient();

    const createPhotoCardMutation = useMutation({
        mutationFn: addPhotoCard,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries(["photoCards"])
            setUploadSuccessful(true);
            open();
        },
        onError: (error) => {
            console.log("UploadForm - createPhotoCardMutation() - got an error: ");
            console.log(error);
            setError("Upload failed with '"+extractMessageFromRestError(error)+"'");
        }

    });

    const submitHandler = async (event) => {
        console.log("UploadForm.submitHandler()");
        event.preventDefault();
        
        setError(null);
        setUploadSuccessful(false);
        const validation = form.validate();
        console.log("UploadForm.submitHandler() - validation is:");
        console.log(validation);
        if (validation.hasErrors){
            return;
        }

        const formValues = form.values;
        console.log("UploadForm.submitHandler() - form.values is:");
        console.log(formValues);

        // const enteredFrontFileValue = frontFileInputRef.current.value;

        // get the reference to the files
        const enteredFrontFileObj = form.values.frontfile; //event.target[0].files[0]
        const enteredBackFileObj = form.values.backfile; //event.target[1].files[0]

        const enteredGroupNameValue = form.values.groupname; //groupNameInputRef.current.value;
        const enteredCardNameValue = form.values.cardname; //memberNameInputRef.current.value;
        const shareValue = form.values.share; //isPrivateInputRef.current.checked;

        createPhotoCardMutation.mutate({
            frontFile: enteredFrontFileObj,
            backFile: enteredBackFileObj,
            groupName: enteredGroupNameValue,
            cardName: enteredCardNameValue,
            share: shareValue
        });
    };

    useEffect(() => {
        // console.log("UploadForm - useEffect() for loading")
        if (createPhotoCardMutation.status === "loading"){
            openLoader();
        } else {
            closeLoader();
        }        
    }, [createPhotoCardMutation.status]);

    
    return (
        <>
        <Box maw={300} mx="auto">
            <LoadingOverlay visible={visible} overlayBlur={0.5} />
            <Text size="lg" align="center">Upload Photo Card</Text>
            <FocusTrap>
                <form onSubmit={submitHandler}>
                    <FileInput
                        data-autofocus
                        withAsterisk
                        disabled={visible}
                        label="Front File"
                        placeholder="Pick front of photo card"
                        icon={<IconUpload size="60%" />}
                        {...form.getInputProps('frontfile')}
                    />
                    <FileInput
                        withAsterisk
                        disabled={visible}
                        label="Back File"
                        placeholder="Pick back of photo card"
                        icon={<IconUpload size="60%"/>}
                        {...form.getInputProps('backfile')}
                    />
                    <TextInput 
                        withAsterisk
                        disabled={visible}
                        label="Group Name"
                        placeholder="Enter name of group"
                        {...form.getInputProps('groupname')}
                    />
                    <TextInput
                        withAsterisk
                        disabled={visible}
                        label="Card Name"
                        placeholder="Enter a name for the card"
                        {...form.getInputProps('cardname')}
                    />
                    <Checkbox mt="sm"
                        disabled={visible}
                        label="Share?"
                        {...form.getInputProps('share')}
                    />
                    <Group position="right" mt="md">
                        <Button type="submit" disabled={visible}>Upload</Button>
                    </Group>
                </form>
            </FocusTrap>
        </Box>
        {error != null && <div><Text size="md" c="red" align="center">{error}</Text></div>}
        <Modal opened={successOpened} onClose={close} size="auto" withCloseButton={false} xOffset={-10}>
            <Container>
                <Text align="center">Upload successful</Text>
                <Group position="apart" mt="md">
                    <Button onClick={() =>{
                        form.reset();
                        close();
                    }}>Upload another</Button>
                    <Button component={Link} variant="filled" to="/">Return home</Button>
                </Group>
            </Container>
        </Modal>
</>
    );
};

// UploadForm.propTypes = {
//     onNewUpload: PropTypes.func.isRequired
// };

export default UploadForm;