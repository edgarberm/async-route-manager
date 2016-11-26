'use strict'

import React, { Component } from 'react'
import ReactDom from 'react-dom'


/**
 * @class: AsyncRouteManager
 * @description: The idea behind this component (add-on) is to facilitate the
 * the data preloading of the react-router Route components in the easiest way.
 */
class AsyncRouteManager extends Component {

  static defaultProps = {
    transitionTiemOut: 600
  }

  static propTypes = {
    transitionTiemOut: React.PropTypes.number
  }

  constructor (...args) {
    super(...args)

    // NOTE: para preparar una API consistente es posible que algunas de estas
    // propiedades tengan que ser defaultProps.

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


  checkChildrenConfigProps () {
    if (this.nextChildren.props.route.config) {
      this.fetchingData = true
      const { dataURL, method, body } = this.nextChildren.props.route.config
      let url = this.checkURLParams(dataURL)
      this.fetchData(url, method, body)
    } else {
      if (this.props.transition === true) {
        if (this.initialFetch) this.initialFetch = false
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
      // NOTE: We could define a variable that controls whether the component
      // caches the data or not. this.nextChildren.props.route.loadeed = true
      this.data = data
      this.fetchingData = false
      if (this.initialFetch) this.initialFetch = false

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


  checkURLParams (url) {
    // NOTE: Ugly
    let _url = url.split('/:')
    _url.splice(0, 1)
    const params = _url
    let parts = window.location.pathname.split( '/' );
    parts.splice(0, 2)
    for (let i = 0; i < params.length; i++)
      url = url.replace(`:${params[i]}`, `${parts[i]}`)

    return url
  }


  initializeTransition () {
    this.transitioning = true

    this.forceUpdate(_ => {
      this.dom = ReactDom.findDOMNode(this.refs.child)
      if (this.prevChildren) {
        this.transitionOut()
      } else {
        this.transitionEnter()
      }
    })
  }


  transitionEnter () {
    this.dom.classList.add('transition-enter')
    const st0 = window.setTimeout(_ => {
      this.dom.classList.add('transition-enter-active')
      window.clearTimeout(st0)
    }, 20)
    const st1 = window.setTimeout(_ => {
      this.transitioning = false
      this.dom.classList.remove('transition-enter', 'transition-enter-active')
      this.forceUpdate()
      window.clearTimeout(st1)
    }, this.props.transitionTiemOut + 20)
  }


  transitionOut () {
    this.dom.classList.add('transition-out')
    const st0 = window.setTimeout(_ => {
      this.dom.classList.add('transition-out-active')
      window.clearTimeout(st0)
    }, 20)
    const st1 = window.setTimeout(_ => {
      this.transitioning = false
      this.dom.classList.remove('transition-out', 'transition-out-active')
      this.forceUpdate(_ => {
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

    return (
      <div className="container-manager">
        { (this.initialFetch) ? null : (this.fetchingData) ? this.props.transitionPreloader() : null }
        { (!this.initialFetch) ? <ChildrenComponent { ...childProps } data={ this.data } ref="child" /> : this.props.initialPreloader() }
      </div>
    )
  }

}

export default AsyncRouteManager
