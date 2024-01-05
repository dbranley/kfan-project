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
        
            <ActionIcon variant="outline"
                        color={dark ? 'yellow' : 'black'}
                        onClick={() => toggleColorScheme()}
                        title="Toggle color scheme" size="md"
                        >
                            {dark ? <IconSun style={{ width: '100%', height: '90%'}} stroke={1} /> : 
                                    <IconMoonStars style={{ width: '100%', height: '90%'}} stroke={1} />}
            </ActionIcon>
        
    );
}

export default LightAndDarkModeButton;