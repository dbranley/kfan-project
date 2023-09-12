import React from "react";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { ColorSchemeProvider, MantineProvider, Paper } from "@mantine/core";
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import AppSiteShell from "./AppSiteShell";
import PhotoCardsGridPage from "./pages/PhotoCardsGridPage";
import UploadPhotoCardPage from "./pages/UploadPhotoCardPage";
import PhotoCardDetailPage from "./pages/PhotoCardDetailPage";
import ProfilePage from "./pages/ProfilePage";

const router = createHashRouter([
  {
    path: "/",
    element: <AppSiteShell />,
    children: [
      {index: true, element: <PhotoCardsGridPage  myCards={false} myFavorites={false} />},
      {path: "my-cards", element: <PhotoCardsGridPage myCards={true} myFavorites={false}/>},
      {path: "my-favorites", element: <PhotoCardsGridPage myCards={false} myFavorites={true}/>},
      {path: "upload", element: <UploadPhotoCardPage/>},
      {path: "card/:photoCardId", element: <PhotoCardDetailPage/>},
      {path: "profile/:username", element: <ProfilePage/>},
    ],
  },
]);

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
            <RouterProvider router={router} />
          </Paper>
        </MantineProvider>
      </ColorSchemeProvider>
  );
}

export default App;
