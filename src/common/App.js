import React from 'react';
import Loadable from "react-loadable";
import { Switch, Route } from 'react-router-dom';

const StartPageLoadable = Loadable({
  loader: () => import(/* webpackChunkName: "start-page" */'./startPage/StartPage'),
  loading() {
    return <div>Loading...</div>
  }
});

const NotFoundPageLoadable = Loadable({
  loader: () => import(/* webpackChunkName: "not-found-page" */'./notFoundPage/NotFound'),
  loading() {
    return <div>Loading...</div>
  }
});

const App = () => (
  <Switch>
    <Route exact path="/" component={StartPageLoadable} />
    <Route component={NotFoundPageLoadable} />
  </Switch>
);

export default App;
