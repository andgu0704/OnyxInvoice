import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url === '/api/companies' && req.method === 'GET') {
        const data = fs.readFileSync(path.resolve(__dirname, 'data/companies.json'), 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
        return;
      }
      if (req.url === '/api/companies' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', () => {
          const newCompany = JSON.parse(body);
          if (!newCompany.id) {
            newCompany.id = 'comp_' + Date.now();
          }
          const filePath = path.resolve(__dirname, 'data/companies.json');
          const companies = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          companies.push(newCompany);
          fs.writeFileSync(filePath, JSON.stringify(companies, null, 4));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(newCompany));
        });
        return;
      }
      if (req.url.startsWith('/api/companies/') && req.method === 'DELETE') {
        const id = req.url.split('/').pop();
        const filePath = path.resolve(__dirname, 'data/companies.json');
        let companies = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        companies = companies.filter((c: any) => c.id !== id);
        fs.writeFileSync(filePath, JSON.stringify(companies, null, 4));
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
        return;
      }
      next();
    });
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), apiPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
