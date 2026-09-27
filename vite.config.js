import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  base: '/zhuri-todo/',
  plugins: [basicSsl()],
});