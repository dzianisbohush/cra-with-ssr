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
