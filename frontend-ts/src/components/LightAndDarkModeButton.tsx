import React from "react";
import { IconMoonStars, IconSun } from "@tabler/icons-react";
import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";

function LightAndDarkModeButton() {

    const { colorScheme, setColorScheme } = useMantineColorScheme();

    const computedColorScheme = useComputedColorScheme('light');

    const toggleColorScheme = () => {
        setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
    };

    const dark = colorScheme === 'dark';

    return (
        <div>
            <ActionIcon variant="outline"
                        color={dark ? 'yellow' : 'dark'}
                        onClick={() => toggleColorScheme()}
                        title="Toggle color scheme">
                            {dark ? <IconSun size="1.1rem"/> : <IconMoonStars size="1.1rem"/>}
            </ActionIcon>
        </div>
    );
}

export default LightAndDarkModeButton;