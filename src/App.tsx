import { BrowserRouter, Routes } from 'react-router-dom'
import { kmsRoutes } from './domains/kms'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {kmsRoutes()}
      </Routes>
    </BrowserRouter>
  )
}
