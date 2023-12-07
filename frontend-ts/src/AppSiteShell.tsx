import React, { useState } from "react";

import { AppShell, Burger, Button, Flex, Group, Image, Text, useComputedColorScheme, useMantineTheme } from '@mantine/core';
import LightAndDarkModeButton from "./components/LightAndDarkModeButton";
import { IconBookUpload, IconHome, IconHomePlus } from "@tabler/icons-react";
import { Link, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import AuthButton from "./components/AuthButton";
import { SESSION_EXPIRATION_TIME, defaultUser, getCurrentUser } from "./services/auth";


export default function AppSiteShell() {

    const theme = useMantineTheme();
    const computedColorScheme = useComputedColorScheme('light');
    const [opened, setOpened] = useState(false);
    //const [opened, { toggle }] = useDisclosure();

    const currentUserQuery = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: SESSION_EXPIRATION_TIME,
        initialData: defaultUser,
    });    

    return (
        <AppShell
            styles={{
                main: {
                    background: computedColorScheme === 'dark' 
                        ? theme.colors.dark[8]
                        : theme.colors.gray[2]
                }
            }}
            header={{ height: 55 }}
            navbar={{ width: 220, 
                      breakpoint: 'sm', 
                      collapsed: { mobile: !opened },
                    }}
            padding="md"
        >
            <AppShell.Header p="sm">
                <Group justify="space-between">
                    <Group>
                        <Burger opened={opened} 
                                onClick={() => setOpened((o) => !o)} 
                                hiddenFrom="sm" 
                                size="sm"
                                color={theme.colors.gray[6]}/>
                        <Image width={122} height={31}
                            src="/public/logo-darkorange.svg"
                            onClick={()=>(setOpened(false))}
                            />
                        <Text visibleFrom="xs"
                            size="xl"
                            onClick={() => (setOpened(false))}>Your K-POP Collection</Text>
                    </Group>

                    <Flex onClick={() => (setOpened(false))} justify="flex-end" align="center" gap="xs">
                        <AuthButton />
                        <LightAndDarkModeButton />
                    </Flex>

                </Group>

            </AppShell.Header>
            <AppShell.Navbar p="sm" onBlur={()=>(setOpened(false))}>
                <Button variant="subtle"
                        size="compact-md"
                        fullWidth
                        radius="xs"
                        display={"flex"}
                        leftSection={<IconHome size={21}/>} //fullWidth
                        component={Link}
                        to="/"
                        onClick={() => (setOpened(false))}
                    >All Photo Cards</Button>

                {currentUserQuery.data.id !== 0 &&                      
                 <Button component={Link} 
                         to="/my-cards" 
                         variant="subtle" 
                         size="compact-md" 
                         leftSection={<IconHomePlus size="1.3rem"/>} 
                         fullWidth 
                         display={"inline-flex"} 
                         radius={0}
                         onClick={()=>{setOpened(false)}}
                 >My Photo Cards</Button>}    

                {currentUserQuery.data.id !== 0 &&                      
                 <Button component={Link} 
                         to="/my-favorites" 
                         variant="subtle" 
                         size="compact-md"
                         leftSection={<IconHomePlus size="1.3rem"/>} 
                         fullWidth 
                         display={"inline-flex"}  
                         radius={0}
                         onClick={()=>{setOpened(false)}}
                 >Favorites</Button>}  

                {currentUserQuery.data.id !== 0 &&                      
                 <Button component={Link} 
                         to="/my-followees" 
                         variant="subtle" 
                         size="compact-md"
                         leftSection={<IconHomePlus size="1.3rem"/>} 
                         fullWidth 
                         display={"inline-flex"} 
                         radius={0}
                         onClick={()=>{setOpened(false)}}
                 >Following</Button>} 

                {currentUserQuery.data.id !== 0 &&
                 currentUserQuery.data.upload &&    
                 <Button component={Link} 
                         to="/upload" 
                         variant="subtle" 
                         size="compact-md"
                         leftSection={<IconBookUpload size="1.3rem"/>} 
                         fullWidth 
                         display={"inline-flex"} 
                         radius={0}
                         onClick={()=>{setOpened(false)}}
                 >Upload Photo Card</Button>}   

            </AppShell.Navbar>
            <AppShell.Main>
                <div onClick={()=>(setOpened(false))}><Outlet/></div>
            </AppShell.Main>
        </AppShell>
    );

}