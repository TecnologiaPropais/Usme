import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ====================
// PROXY SOLO PARA DESARROLLO LOCAL
// Esta sección permite que el frontend (Vite) redirija las peticiones /api al backend local.
// NO tiene efecto en producción. Puedes dejarla o comentarla antes de hacer el build de producción.
// En producción, las peticiones /api deben ir al backend real (por ejemplo, configurado en Nginx, etc.)
// ====================

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //server: {
    //proxy: {
    // '/api': 'http://localhost:4000'*/ // SOLO USAR EN LOCAL. Para producción, no es necesario.
    }
  //}
//})

// ====================
// PARA PRODUCCIÓN:
// - Puedes dejar esta sección, no afecta el build.
// - O puedes comentarla/eliminarla si prefieres.
// - Asegúrate de que tu servidor de producción reenvíe /api al backend real.
// ====================
