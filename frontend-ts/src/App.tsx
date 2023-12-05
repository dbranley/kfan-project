import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import { MantineProvider, createTheme, Paper } from '@mantine/core';
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import AppSiteShell from './AppSiteShell';
import PhotoCardDetailPage from './pages/PhotoCardDetailPage';

const router = createHashRouter([
  {
    path: "/",
    element: <AppSiteShell />,
    children: [
      {index: true, element: <div>Main</div>}, 
      {path: "card/:photoCardId", element: <PhotoCardDetailPage/>},
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
