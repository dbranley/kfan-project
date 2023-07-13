import React from "react";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { ColorSchemeProvider, MantineProvider, Paper } from "@mantine/core";

import AppSiteShell from "./AppSiteShell";

function App() {

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  return (
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider theme={{ 
                          colorScheme,
                          primaryColor: 'orange', 
                          globalStyles: (theme) => ({
                            body: {
                              //Looks like setting margin to 0 fixes issue with vertical scrollbar always appearing
                              margin: "0px"
                            }
                          })
                        }}>
          <Paper>
            <AppSiteShell/>
          </Paper>
        </MantineProvider>
      </ColorSchemeProvider>
  );
}

export default App;
