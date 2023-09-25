import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import App from './App.jsx'
// import { AuthContextProvider } from './store/auth-context.jsx'
// import './index.css'

const queryClient = new QueryClient({
  //set default stale time for queries to 5 minutes
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 }},
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <AuthContextProvider> */}
        <App />
        <ReactQueryDevtools/>
      {/* </AuthContextProvider> */}
    </QueryClientProvider>
  </React.StrictMode>,
)
