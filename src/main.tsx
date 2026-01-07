import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'
import { loadConfig } from './config.ts'


loadConfig().then(() => {
  createRoot(document.getElementById('root')!).render(
    <App />
  )
});
