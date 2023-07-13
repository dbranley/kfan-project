import React from "react";
import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons-react";

function LightAndDarkModeButton() {

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';



    return (
      <div>
      <ActionIcon
      variant="outline"
      color={dark ? 'yellow' : 'dark'}
      onClick={() => toggleColorScheme()}
      title="Toggle color scheme"
    >
      {dark ? <IconSun size="1.1rem" /> : <IconMoonStars size="1.1rem" />}
    </ActionIcon>
      </div>
    );
  }
  
  export default LightAndDarkModeButton;