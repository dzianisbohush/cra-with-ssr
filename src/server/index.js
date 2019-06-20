import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable-ssr-addon';
import { StaticRouter } from 'react-router-dom';
import App from '../common/App';

import manifest from  '../../dist/react-loadable-ssr-addon';

const PORT = 3000;
const server = express();

server.use(express.static('dist'));

server.use('/', (req, res) => {
  const modules = new Set();
  const context = {};

  const html = renderToString(
    <Loadable.Capture report={moduleName => modules.add(moduleName)}>
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>
    </Loadable.Capture>
  );

  const bundles = getBundles(manifest, [
    ...manifest.entrypoints,
    ...Array.from(modules)
  ]);

  const scripts = bundles.js || [];
  const styles = bundles.css || [];

  res.send(`
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Simple weather app</title>
        ${styles.map(style => {
    return `<link href="${style.file}" rel="stylesheet" />`;
  }).join('\n')}
    </head>
    <body>
        <div id="root">${html}</div>
        ${scripts.map(script => {
        return `
              <script src="${script.file}"></script>`; }).join(' ')
        }
         <script>
          if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/serviceWorker.js');
              });
          }
        </script>
    </body>
    </html>
  `);
});

Loadable.preloadAll()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Running on http://localhost:${PORT}/`);
    });
  })
  .catch(err => {
    console.log(err);
  });
