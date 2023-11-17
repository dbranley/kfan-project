import React, { useState } from "react";

import { AppShell, Burger, Button, Flex, Group, Image, Text, useComputedColorScheme, useMantineTheme } from '@mantine/core';
import LightAndDarkModeButton from "./components/LightAndDarkModeButton";
import { IconHomePlus } from "@tabler/icons-react";
import AuthButton from "./components/AuthButton";

export default function AppSiteShell() {

    const theme = useMantineTheme();
    const computedColorScheme = useComputedColorScheme('light');
    const [opened, setOpened] = useState(false);
    //const [opened, { toggle }] = useDisclosure();

    

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
                        size="md"
                        radius="xs"
                        display={"flex"}
                        leftSection={<IconHomePlus size={21}/>} //fullWidth
                        onClick={() => (setOpened(false))}
                    >All Photo Cards</Button>
            </AppShell.Navbar>
            <AppShell.Main>Main</AppShell.Main>
        </AppShell>
    );

}