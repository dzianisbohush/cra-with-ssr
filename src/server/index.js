import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'fs';
import App from '../common/App';

const PORT = 3000;
const server = express();

server.use('^/$', (req, res) => {
  const html = renderToString(<App />);

  fs.readFile('build/index.html', 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err);
      return res.status(500).send('Oops, better luck next time!');
    }
    return res.send(
      data.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    );
  });
});

server.use(express.static('build'));

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
