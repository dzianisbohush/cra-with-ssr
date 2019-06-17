# SSR. Pros and cons.
SSR stands for Server Side Rendering. SSR is a technique for rendering app on the server and then sending a fully rendered page to the client.
Two main benefits of SSR are performance benefit and SEO optimization.
Lets go to details.

## Performance benefit.
Difference beetween SSR and CSR (client-side rendering):

![SSR](https://cdn-images-1.medium.com/max/800/1*jJkEQpgZ8waQ5P-W5lhxuQ.png)
![CSR](https://cdn-images-1.medium.com/max/800/1*CRiH0hUGoS3aoZaIY4H2yg.png)

For SSR we have rendered html with links to scripts in browser. For CSR case we have only links to scripts. It means that user will see some content faster with SSR scenario. The initial page load is faster.
But it is theoretical performance benefit because SSR work speed affects from internet speed of the user making the request, physical location of server and count of users which are trying to access the site.

## SEO optimization.
One of benefit of using SSR is in having an app that can be crawled for its content even for crawlers that don’t execute JavaScript code. This can help with SEO and with providing meta data to social media channels.

Page source for start page of create-react-app:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <!--
manifest.json provides metadata used when your web app is installed on a
user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
-->
    <link rel="manifest" href="/manifest.json" />
    <!--
Notice the use of in the tags above.
It will be replaced with the URL of the `public` folder during the build.
Only files inside the `public` folder can be referenced from the HTML.

Unlike "/favicon.ico" or "favicon.ico", "/favicon.ico" will
work correctly both with client-side routing and a non-root public URL.
Learn how to configure a non-root public URL by running `npm run build`.
-->
    <title>React App</title>
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!--
This HTML file is a template.
If you open it directly in the browser, you will see an empty page.

You can add webfonts, meta tags, or analytics to this file.
The build step will place the bundled scripts into the <body> tag.

To begin the development, run `npm start` or `yarn start`.
To create a production bundle, use `npm run build` or `yarn build`.
-->
    <script src="/static/js/bundle.js"></script>
    <script src="/static/js/0.chunk.js"></script>
    <script src="/static/js/main.chunk.js"></script>
</body>
</html>
```

And the page source for the same page with ssr:
```html
<!doctype html>
<html lang="en">
   <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <title>Simple weather app</title>
      <link href="index.css" rel="stylesheet" />
      <link href="2.css" rel="stylesheet" />
   </head>
   <body>
      <div id="root">
         <div class="App">
            <header class="App-header">
               <img src="data:image/svg+xml;base64,..." class="App-logo" alt="logo" />
               <p>Edit <code>src/App.js</code> and save to reload.</p>
               <a class="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">Learn React</a>
            </header>
         </div>
      </div>
      <script src="index.js"></script>
      <script src="start-page.chunk.js"></script>
   </body>
</html>
```
As we can see in first snippet we have only links to scripts in the body tag and in second snippet we see rendered html and links to scripts. Second scenario is good for SEO bot, it can read context of page. 

## SSR cons.
SSR is not silver bullet for all use cases. Major cons of SSR are frequent server requests and full page reloads.

In conclusion, this is quote of Adam Zerner:
>SSR is analogous to you driving over to the supermarket every time you want to eat.
With client-side rendering, you go to the supermarket once and spend 45 minutes walking around buying a bunch of food for the month. Then, whenever you want to eat, you just open the fridge.

# Migarating create-react-app to SSR.
Let's start create-react-app (CRA).
```bash
$ npx create-react-app cra-with-ssr
$ cd cra-with-ssr
$ npm start
```
Go to stat page in the browser. If we go to page source, we can see that html is almost empty, CRA has only links to scripts. Our goal is getting rendered page from page. 
Go to the project. 
Lets change some structure. Add server folder. The folder will contain entry point for server bundle. Add common folder. the folder will contain common components for client and server bundle.

```
.
└── src
    ├── common
    │   ├── App.css
    │   ├── App.js
    │   └── logo.svg
    ├── index.css
    ├── index.js
    └── server
        └── index.js
```
Change path to App component and replace render to hydrate method (indicates to the DOM renderer that we’re rehydrating the app after a server-side render) in src/index.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './common/App';

ReactDOM.hydrate(<App />, document.getElementById('root'));
````
Let`s go to configure server. Install Express:
```bash
$ npm install express
```
Here is content for src/server/index.js:
```javascript
import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import fs from "fs";
import App from "../common/App";

const PORT = 3000;
const server = express();

server.use("^/$", (req, res) => {
  //render app to string
  const html = renderToString(<App />);

  fs.readFile("build/index.html", "utf8", (err, data) => {
    if (err) {
      console.error("Something went wrong:", err);
      return res.status(500).send("Oops, better luck next time!");
    }
    //inject app`s static contents to the div with id equal root
    return res.send(
      data.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    );
  });
});

//serve contents from build directory as static files
server.use(express.static("build"));

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
```
We have command for build client bundle by default. It is `$ npm build` command. 
Now, let`s configure webpack for create server bundle.
Install dev dependencies:
```bash
 npm i webpack-cli nodemon webpack-node-externals --save-dev
 ```
 Add `webpack.config.js` to root of project.
 This is content of `webpack.config.js`:
 ```javascript
 const path = require('path');
const webpackNodeExternals = require('webpack-node-externals');

const config = {
  target: 'node',
  entry: './src/server/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build-server')
  },
  externals: [webpackNodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        }
      },
      {
        test: /\.(gif|jpe?g|png|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
            },
          },
        ]
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2).*$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
            },
          },
        ]
      },
      {
        test: /\.css$/i,
        use: ['css-loader'],
      }
    ]
  }
};

module.exports = config;
 ```
This config says that entry point is ./src/server/index.js, output is ./build-server directory with ./build-server/bundle.js server bundle.
Next we should add commands for start server.
```json
{
     "scripts": {
        "start": "react-scripts start",
        "start-server": "npm run clean-build-folders && npm run build && npm run build-server && npm run run-server",
        "build-server": "NODE_ENV=development webpack --config webpack.server.js --mode=development",
        "run-server": "nodemon ./build-server/bundle.js",
        "clean-build-folders": "rm -rf ./build/ && rm -rf ./build-server/",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
     }
 }
```
Run in terminal:
```bash
$ npm run start-server
```
After these commands, we should see `Server is listening on port 3000`.
Our project structure now is:
```
.
├── build
│   └── ...
├── build-server
│   └── bundle.js
├── package.json
├── package-lock.json
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── README.md
└── src
    ├── common
    │   ├── App.css
    │   ├── App.js
    │   └── logo.svg
    ├── index.css
    ├── index.js
    └── server
        └── index.js
```
Go to [localhost:3000](localhost:3000)
In page source we can see rendered html inside div with id equal root.
```html
<!doctype html>
<html lang="en">
   <head>
      <meta charset="utf-8"/>
      <link rel="shortcut icon" href="/favicon.ico"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <meta name="theme-color" content="#000000"/>
      <link rel="manifest" href="/manifest.json"/>
      <title>React App</title>
      <link href="/static/css/main.2cce8147.chunk.css" rel="stylesheet">
   </head>
   <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <div id="root">
         <div class="App" data-reactroot="">
            <header class="App-header">
               <img src="data:image/svg+xml;base64,..." class="App-logo" alt="logo"/>
               <p>Edit <code>src/App.js</code> and save to reload.</p>
               <a class="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">Learn React</a>
            </header>
         </div>
      </div>
      <script>//this contains runtime script</script>
      <script src="/static/js/2.b41502e9.chunk.js"></script>
      <script src="/static/js/main.c9fd7423.chunk.js"></script>
   </body>
</html>
```
Let`s go to code splitting.

## Code splitting.
![A single giant bundle vs multiple smaller bundles](http://thejameskyle.com/img/react-loadable-split-bundles.png)

Code splitting is a technique which allow create some count of little chunks instead of single huge bundle. CRA has code splitting by default. When we run `$ npm run build` we can see in ./build/static/js/ folder some count of chunks. But CRA load all chunks for every route. 

Let`s add routes for check this.
Change some project structure for ./src/common/ 
Create notFoundPage and startPage folders. Folder startPage should contains our default CRA App component but we rename this to StartPage. Add notFoundPage folder with NotFound component.
Now we have this structure :
```
.
└── src
    ├── common
    │   ├── App.js
    │   ├── notFoundPage
    │   │   ├── NotFound.css
    │   │   └── NotFound.js
    │   └── startPage
    │       ├── logo.svg
    │       ├── StartPage.css
    │       └── StartPage.js
    ├── index.css
    ├── index.js
    └── server
        └── index.js
```
'NotFound.js':
```javascript
import React from 'react';

import './NotFound.css';

const NotFound = () => {
  return (
    <div className='main-wrapper'>
      <div className={'title-wrapper'}>
        <h1>404</h1>
        <p>page not found</p>
      </div>
    </div>
  );
};

export default NotFound;
```
`NotFound.css`:
```css
.main-wrapper {
  position: relative;
  height: 100vh;
  background: linear-gradient(
          135deg,
          #1e5799 0%,
          #207cca 32%,
          #207cca 32%,
          #2989d8 50%,
          #1e5799 97%,
          #7db9e8 100%
  );
}

.title-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  text-transform: uppercase;
  text-align: center;
  color: white;
  font-weight: bold;
}

.title-wrapper h1 {
  font-size: 5rem;
  margin: 0;
}

.title-wrapper p {
  font-size: 2rem;
  margin: 0;
}
```
`App.js`:
```javascript
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import startPage from './startPage/StartPage';
import notFoundPage from './notFoundPage/NotFound';

const App = () => (
  <Switch>
    <Route exact path="/" component={startPage} />
    <Route component={notFoundPage} />
  </Switch>
);

export default App;
```
Install 'react-route-dom'
```bash
$ npm i react-router-dom
```
Also we should add StaticRouter to server.
`.src/server/index.js`:
```javascript
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import fs from 'fs';
import App from '../common/App';

const PORT = 3000;
const server = express();

server.use('/', (req, res) => {
  const context = {};
  const html = renderToString(
    <StaticRouter location={req.url} context={context}>
      <App />
    </StaticRouter>
  );

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
```
Now when we start server `$ npm start-server` we can see  in `http://localhost:3000/` and `http://localhost:3000/not-found` page sources that included chunks are equal. It is mean that all chunks loads for all page. 
For load only need chunks for each route we can use dynamic import ( [dynamic import() describe](https://v8.dev/features/dynamic-import)) with react-loadable ( [react-loadable source](https://github.com/jamiebuilds/react-loadable) ) library.
