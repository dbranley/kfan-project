import '@mantine/core/styles.css';
import { Button, MantineProvider } from '@mantine/core';
import './App.css'

function App() {

  return (
    <MantineProvider>
      <div>
        <Button>Hello World</Button>
      </div>
    </MantineProvider>
  )
}

export default App
