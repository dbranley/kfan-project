import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';

import AppSiteShell from './AppSiteShell';

const theme = createTheme({
  primaryColor: 'orange',

});

function App() {

  return (
    <MantineProvider theme={theme}
                     defaultColorScheme='light'>
      <AppSiteShell/>
    </MantineProvider>
  )
}

export default App
