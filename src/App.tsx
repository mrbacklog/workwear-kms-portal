import { BrowserRouter, Routes } from 'react-router-dom'
import { kmsPortalRoutes } from './domains/kms'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {kmsPortalRoutes()}
      </Routes>
    </BrowserRouter>
  )
}
