import React, { Component } from 'react'
import ReactDom from 'react-dom'
import 'whatwg-fetch'
import matchPath from './matchPath'


/**
 * @class: AsyncRouteManager
 * @description: The idea behind this component is to facilitate the
 * data fetch and preloading for the react-router Route components in the easiest way.
 */
class AsyncRouteManager extends Component {

  static defaultProps = {
    transition: true,
    transitionTiemOut: 600
  }

  static propTypes = {
    transition: React.PropTypes.bool,
    transitionTiemOut: React.PropTypes.number
  }

  constructor (...args) {
    super(...args)

    this.initialFetch = true
    this.fetchingData = false
    this.prevChildren = null
    this.nextChildren = null
    this.dom = null
    this.transitioning = false
    this.data = {}
  }


  componentWillMount () {
    this.nextChildren = this.props.children
    this.checkChildrenConfigProps()
  }


  componentWillReceiveProps (nextProps) {
    // If the new view is the actual view, we don't render
    if (this.props.children.type.name === nextProps.children.type.name)
      return false

    this.prevChildren = this.nextChildren
    this.nextChildren = nextProps.children

    this.checkChildrenConfigProps()
  }


  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.children.type.name === nextProps.children.type.name) {
      return false
    } else {
      return true
    }
  }


  checkChildrenConfigProps () {
    if (this.nextChildren.props.route.config && !this.nextChildren.props.route.config.hasdata) {
      this.fetchingData = true
      const { URL, method, body } = this.nextChildren.props.route.config
      let url = this.composeURLParameters(URL)
      this.fetchData(url, method, body)
    } else {
      if (this.props.transition === true) {
        if (this.initialFetch)
          this.initialFetch = false

        this.initializeTransition()
      } else {
        this.forceUpdate()
      }
    }
  }


  fetchData (url, method, body) {
    fetch(url, {
      method: method,
      body: body
    })
    .then(this.checkFetchStatus)
    .then(this.parseJSON)
    .then(data => {
      this.data = data
      this.fetchingData = false

      this.nextChildren.props.route.config.hasdata = true
      this.nextChildren.props.route.config.data = data

      if (this.initialFetch)
        this.initialFetch = false

      if (this.props.transition === true)
        this.initializeTransition()
      else
        this.forceUpdate()
    })
    .catch(error => {
      throw error
    })
  }


  checkFetchStatus (response) {
    if (response.status >= 200 && response.status < 400) {
      return response
    } else {
      const error = new Error(response.statusText)
      error.response = response
      throw error
    }
  }


  parseJSON (response) {
    const data = response.json()
    return data
  }


  composeURLParameters (path) {
    let url = this.props.apiBaseURL
    const match = matchPath(window.location.pathname, {
      path: path,
      exact: true,
      strict: false
    })

    // NOTE: we dont need cath the error because the react-router already takes care of it
    if (match.isExact) return `${ url }${ match.url }`
  }


  initializeTransition () {
    this.transitioning = true

    this.forceUpdate(() => {
      this.dom = ReactDom.findDOMNode(this.refs.child)
      if (this.prevChildren) {
        this.transitionOut()
      } else {
        this.transitionEnter()
      }
    })
  }


  transitionEnter () {
    if (this.prevChildren && this.prevChildren.props.route.config && !this.prevChildren.props.route.config.datacaching) {
      this.prevChildren.props.route.config.hasdata = false
      this.prevChildren.props.route.config.data = null
    }

    this.dom.classList.add('transition-enter')
    const st0 = window.setTimeout(() => {
      this.dom.classList.add('transition-enter-active')
      window.clearTimeout(st0)
    }, 20)
    const st1 = window.setTimeout(() => {
      this.transitioning = false
      this.dom.classList.remove('transition-enter', 'transition-enter-active')
      this.forceUpdate()
      window.clearTimeout(st1)
    }, this.props.transitionTiemOut + 20)
  }


  transitionOut () {
    this.dom.classList.add('transition-out')
    const st0 = window.setTimeout(() => {
      this.dom.classList.add('transition-out-active')
      window.clearTimeout(st0)
    }, 20)
    const st1 = window.setTimeout(() => {
      this.transitioning = false
      this.dom.classList.remove('transition-out', 'transition-out-active')
      this.forceUpdate(() => {
        this.dom = ReactDom.findDOMNode(this.refs.child)
        this.transitionEnter()
        window.clearTimeout(st1)
      })
    }, this.props.transitionTiemOut + 20)

  }


  render() {
    const prevComponent = (this.prevChildren)
                        ? this.prevChildren.props.route.component
                        : this.nextChildren.props.route.component
    const nextComponent = this.nextChildren.props.route.component
    const ChildrenComponent = (this.fetchingData || this.transitioning) ? prevComponent : nextComponent

    const prevProps = (this.prevChildren)
                        ? this.prevChildren.props
                        : this.nextChildren.props
    const nextProps = this.nextChildren.props
    const childProps = (this.fetchingData || this.transitioning) ? prevProps : nextProps
    const data = childProps.route.config ? childProps.route.config.data : null

    return (
      <div className="container-manager">
        { (this.initialFetch) ? null : (this.fetchingData) ? this.props.transitionPreloader() : null }
        { (!this.initialFetch) ? <ChildrenComponent { ...childProps } data={ data } ref="child" /> : this.props.initialPreloader() }
      </div>
    )
  }

}

export default AsyncRouteManager
