import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import { MantineProvider, createTheme, Paper } from '@mantine/core';
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import AppSiteShell from './AppSiteShell';
import PhotoCardDetailPage from './pages/PhotoCardDetailPage';
import PhotoCardsGridPage from './pages/PhotoCardsGridPage';
import UploadPhotoCardPage from './pages/UploadPhotoCardPage';

const router = createHashRouter([
  {
    path: "/",
    element: <AppSiteShell />,
    children: [
      {index: true, element: <PhotoCardsGridPage myCards={false}  myFavorites={false} myFollowees={false}/>}, 
      {path: "my-cards", element: <PhotoCardsGridPage myCards={true} myFavorites={false} myFollowees={false}/>},
      {path: "my-favorites", element: <PhotoCardsGridPage myCards={false} myFavorites={true} myFollowees={false}/>},
      {path: "my-followees", element: <PhotoCardsGridPage myCards={false} myFavorites={false} myFollowees={true}/>},
      {path: "card/:photoCardId", element: <PhotoCardDetailPage/>},
      {path: "upload", element: <UploadPhotoCardPage/>},
    ],
  }
]);

const theme = createTheme({
  primaryColor: 'orange',

});

function App() {

  return (
    <MantineProvider theme={theme}
                     defaultColorScheme='light'>
      <Paper>
        <RouterProvider router={router}/>
      </Paper>
    </MantineProvider>
  )
}

export default App
