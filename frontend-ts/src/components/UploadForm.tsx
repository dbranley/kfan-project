import React, { useState, useEffect } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { IconUpload, IconDisc, IconCalendarEvent, IconShirt } from "@tabler/icons-react";

import { Box, 
         Button, 
         Center, 
         Checkbox, 
         Container, 
         FileInput, 
         Group, 
         Modal,
         SegmentedControl, 
         Text, 
         TextInput, 
         LoadingOverlay, 
         FocusTrap } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "react-router-dom";

import { addPhotoCard } from "../services/photo-cards";
import { extractMessageFromRestError } from "../utils";

const UploadForm = () => {

    const [error, setError] = useState<string | null>(null);
    const [successOpened, {open, close}] = useDisclosure(false);
    const [visible, { open: openLoader, close: closeLoader }] = useDisclosure(false);

    const form = useForm({
        initialValues: {
            frontfile: null,
            backfile: null,
            groupname: '',
            cardname: '',
            sourcetype: 'album',
            sourcename: '',
            share: false,
        },
        validate: {
            frontfile: (value) => ((value === null || value === undefined) ? 'Front photo required': null),
            backfile: (value) => ((value === null || value === undefined) ? 'Back photo required': null),
            groupname: (value) => (value.length <1 ? 'Group name required': null),
            cardname: (value) => (value.length <1 || value.length > 100? 'Card name required and not longer than 100 characters': null),
        }
    });

    const queryClient = useQueryClient();

    const createPhotoCardMutation = useMutation({
        mutationFn: addPhotoCard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["photoCards"]} )
            open();
        },
        onError: (error) => {
            console.log("UploadForm - createPhotoCardMutation() - got an error: ");
            console.log(error);
            setError("Upload failed with '"+extractMessageFromRestError(error)+"'");
        }
    });    

    const submitHandler = async (event: React.FormEvent) => {
        console.log("UploadForm.submitHandler()");
        event.preventDefault();
        
        setError(null);
        // setUploadSuccessful(false);
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
        
        const enteredSourceName = form.values.sourcename;
        let enteredSourceType = '';
        if (enteredSourceName.length > 0){
            enteredSourceType = form.values.sourcetype;
        }

        createPhotoCardMutation.mutate({
            frontFile: enteredFrontFileObj,
            backFile: enteredBackFileObj,
            groupName: enteredGroupNameValue,
            cardName: enteredCardNameValue,
            sourceType: enteredSourceType,
            sourceName: enteredSourceName,
            share: shareValue
        });
    };

    useEffect(() => {
        // console.log("UploadForm - useEffect() for loading")
        if (createPhotoCardMutation.status === "pending"){
            openLoader();
        } else {
            closeLoader();
        }        
    }, [createPhotoCardMutation.status, openLoader, closeLoader]);

    return (
        <>
            <Box maw={300} mx="auto">
                <LoadingOverlay visible={visible} overlayProps={{blur: 0.5}} />
                <Text size="lg" ta="center">Upload Photo Card</Text>
                <FocusTrap>
                    <form onSubmit={submitHandler}>
                        <FileInput
                            data-autofocus
                            withAsterisk
                            disabled={visible}
                            label="Front File"
                            // placeholder="Pick front of photo card"
                            // bug: https://github.com/mantinedev/mantine/issues/5401
                            leftSection={<IconUpload size="60%" />}
                            {...{placeholder:"Pick front of photo card"}}
                            {...form.getInputProps('frontfile')}
                        />
                        <FileInput
                            withAsterisk
                            disabled={visible}
                            label="Back File"
                            // placeholder="Pick back of photo card"
                            // bug: https://github.com/mantinedev/mantine/issues/5401
                            leftSection={<IconUpload size="60%"/>}
                            {...{placeholder:"Pick back of photo card"}}
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
                        <TextInput
                            disabled={visible}
                            label="Source of Card"
                            placeholder="Enter where the card came from"
                            {...form.getInputProps('sourcename')}
                        />
                        <SegmentedControl 
                            fullWidth
                            mt={1}
                            disabled={!form.isDirty('sourcename')}
                            data={[
                                { value: 'album',
                                label: (
                                <Center>
                                    <IconDisc size="1.1rem" color={`${form.isDirty('sourcename') ? '#fd7e14' : '#868e96'}`}/>
                                    <Box ml={10}>Album</Box>
                                </Center>
                                ),
                            },
                            { value: 'event',
                                label: (
                                <Center>
                                    <IconCalendarEvent size="1.1rem" color={`${form.isDirty('sourcename') ? '#fd7e14' : '#868e96'}`}/>
                                    <Box ml={10}>Event</Box>
                                </Center>
                                ),
                            },
                            { value: 'merch',
                                label: (
                                <Center>
                                    <IconShirt size="1.1rem" color={`${form.isDirty('sourcename') ? '#fd7e14' : '#868e96'}`}/>
                                    <Box ml={10}>Merch</Box>
                                </Center>
                                ),
                            },                        
                            ]}
                            {...form.getInputProps('sourcetype')}

                        />
                        <Checkbox mt="sm"
                            disabled={visible}
                            label="Share?"
                            {...form.getInputProps('share')}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button type="submit" disabled={visible}>Upload</Button>
                        </Group>
                    </form>
                </FocusTrap>
            </Box>    
            {error != null && <div><Text size="md" c="red" ta="center">{error}</Text></div>}
            <Modal opened={successOpened} onClose={close} size="auto" withCloseButton={false} xOffset={-10}>
                <Container>
                    <Text ta="center">Upload successful</Text>
                    <Group justify="space-between" mt="md">
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

export default UploadForm;