const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const getPort = require('get-port'); // this returns a Promise-returning function

const app = express();
const PROXY_PORT = 3000;

let backendProcess, frontendProcess;


async function startServers() {
  // ✅ Properly call getPort() for each service
  const backendPort = await getPort({ port: getPort.makeRange(5000, 5100) });
  const frontendPort = await getPort({ port: getPort.makeRange(5173, 5200) });

  // Check for unique ports
  if (backendPort === frontendPort) {
    console.error('❌ Could not find two unique free ports for backend and frontend.');
    process.exit(1);
  }

  console.log(`✅ Allocated ports — Backend: ${backendPort}, Frontend: ${frontendPort}`);

  // Start backend (Express)
  backendProcess = spawn('npm', ['run', 'dev', '--prefix', '../appnest-backend'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: backendPort },
  });
  console.log('🚀 Starting backend...');

  // Start frontend (React)
  frontendProcess = spawn('npm', ['run', 'dev', '--prefix', '../../frontend-app'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: frontendPort },
  });
  console.log('🚀 Starting frontend...');

  // Proxy backend
  app.use(
    '/backend',
    createProxyMiddleware({
      target: `http://localhost:${backendPort}`,
      changeOrigin: true,
      pathRewrite: { '^/backend': '' },
      logLevel: 'silent',
    })
  );

  // Proxy frontend
  app.use(
    '/frontend',
    createProxyMiddleware({
      target: `http://localhost:${frontendPort}`,
      changeOrigin: true,
      pathRewrite: { '^/frontend': '' },
      logLevel: 'silent',
    })
  );

  // Start proxy
  app.listen(PROXY_PORT, () =>
    console.log(`🌐 Proxy server running at http://localhost:${PROXY_PORT}`)
  );
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  if (backendProcess) backendProcess.kill('SIGINT');
  if (frontendProcess) frontendProcess.kill('SIGINT');
  process.exit();
});

// Run
startServers().catch((err) => {
  console.error('❌ Error starting servers:', err);
  process.exit(1);
});
