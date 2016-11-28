# Async Route Manager

🚨 This repo is a proof of concept and is not ready for production.

The idea behind this component (add-on) is to facilitate the the data preloading
of the [react-router](https://www.npmjs.com/package/react-router) Route components
in the easiest way.

The problem with React Router is that it does not know if the child component has
the data needed to be rendered. In most cases the data comes from an API, and is
not available when you execute the `componentWillMount` method of the component.

In the ideal scenario, a preloader should appear while the data is being obtained,
and once the data is available, the component can be rendered. Wait 🤔, in the ideal scenario,
the first preloader must be different from the preloader for the sections.

Maybe an illustrated example can be more explicit...

![async-route-manager gif](http://www.builtbyedgar.com/lab/async-route-manager.gif)
* API resources for the example by [Reqres](http://reqres.in). Thanks!


## Integration

**NOTE**: More details soon.

### Configure the routes

```js
const dashboardConfig = {
  dataURL: 'http://reqres.in/api/users?delay=3',
  method: 'GET',
  body: null
}

const detailConfig = {
  dataURL: `http://reqres.in/api/users/:id`,
  method: 'GET',
  body: null
}
```

 ```jsx
<Route path='/' component={ App }>
  <IndexRoute component={ Home } />
  <Route path="dashboard" component={ Dashboard } config={ dashboardConfig } />
  <Route path="dashboard/:id" component={ Detail } config={ detailConfig } />
</Route>
 ```

### Configure the component

```js
'use strict'

import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import AsyncRouteManager from './AsyncRouteManager'

class App extends Component {

  static propTypes = {
    children: PropTypes.object.isRequired
  }

  constructor (...args) {
    super(...args)
  }

  render() {

    return (
      <div>
        <ul>
          <li><Link to='/'>Home</Link></li>
          <li><Link to='/dashboard'>Dashboard</Link></li>
        </ul>
        <AsyncRouteManager initialPreloader={ MasterPreloader }
                           transitionPreloader={ TransitionPreloader }
                           transition={ true }
                           transitionTiemOut={ 200 } >
          { this.props.children }
        </AsyncRouteManager>
      </div>
    )
  }


  initialPreloader () {
    return (
      <div className="initial-loader">
        <h1>Preloading...</h1>
      </div>
    )
  }


  transitionPreloader () {
    return(
      <div className="transition-loader">
        <div className="transition-loader__line"></div>
      </div>
    )
  }
}

export default App

```

### Configure CSS transitions

```css
.transition-enter {
  opacity: 0.01;
  -webkit-transition: opacity 200ms ease;
  transition: opacity 200ms ease;
}

.transition-enter.transition-enter-active {
  opacity: 1;
}


.transition-out {
  opacity: 1;
  -webkit-transition: opacity 200ms ease;
  transition: opacity 200ms ease;
}

.transition-out.transition-out-active {
  opacity: 0.01;
}
```
