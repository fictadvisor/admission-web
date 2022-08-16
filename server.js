require('dotenv').config();

const express = require('express');
const cors = require('cors');
const next = require('next');

const app = next({
  dev: process.env.NODE_ENV !== 'production',
});

const handle = app.getRequestHandler();

(async () => {
  await app.prepare();

  const server = express();
  
  server.use(cors());

  server.get('*', (req, res) => handle(req, res));

  const port = process.env.PORT || 3000;
  await server.listen(port);

  console.log(`> Ready on http://localhost:${port}`);
})();
