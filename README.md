# AsyncRouteManager

The idea behind this component (add-on) is to facilitate the the data preloading
of the [`react-router`](https://www.npmjs.com/package/react-router) Route components
in the easiest way.

The problem with React Router is that it does not know if the child component has
the data needed to be rendered. In most cases the data comes from an API and is
not available when you execute the componentWillMount method of the component.

In the ideal scenario, a preload should appear while the data is being obtained,
and once the data is available, render the component.


## Integration


TODO
