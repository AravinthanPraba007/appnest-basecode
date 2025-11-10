import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CoreUI from './CoreUi.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CoreUI />
  </StrictMode>,
)
