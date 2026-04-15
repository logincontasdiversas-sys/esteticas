import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Definir variáveis de ambiente diretamente aqui para desenvolvimento
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://iodltsabwyvuxxudxzky.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZGx0c2Fid3l2dXh4dWR4emt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzU2OTcsImV4cCI6MjA5MTg1MTY5N30.IfFNW_SkMtUUChQ4IG3cZErZjTuCcVuv7eIEsjkG4l4'),
    'import.meta.env.SITE_URL': JSON.stringify('http://127.0.0.1:8081'),
  },
  server: {
    host: true,
    port: 8081,
  },
})