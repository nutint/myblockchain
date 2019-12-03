import React from 'react'
import { render } from 'react-dom'
import { Router, Switch, Route } from 'react-router-dom'
import history from './history'

import App from './components/App'
import Blocks from './components/Blocks'
import ConductTransaction from './components/ConductTransaction'

render(
  <Router history={history}>
    <Switch>
      <Route exact={ true } path='/' component={ App } />
      <Route path='/blocks' component={ Blocks } />
      <Route path='/conduct-transaction' component={ConductTransaction} />
    </Switch>
  </Router>,
  document.getElementById('root')
)