import '@mantine/core/styles.css';
import { MantineProvider, createTheme, Paper } from '@mantine/core';
import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

import AppSiteShell from './AppSiteShell';

const router = createHashRouter([
  {
    path: "/",
    element: <AppSiteShell />,
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
