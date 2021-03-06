// @flow
import { PureComponent, createElement } from 'react'
import { polyfill } from 'react-lifecycles-compat'
import PropTypes from 'prop-types'
import invariant from 'invariant'
import createConnectedFields from './ConnectedFields'
import prefixName from './util/prefixName'
import type { Structure, ReactContext } from './types'
import type { Props } from './QueryFieldsProps.types'
import { removeFieldsHandlers } from './util/removeHandlers'
import { compose } from 'lodash/fp'
import { validateNameProp } from './util/validateNameProp'

const createQueryFields = (structure: Structure<*, *>) => {
  const ConnectedFields = createConnectedFields(structure)

  class QueryFields extends PureComponent<Props> {
    constructor(props: Props, context: ReactContext) {
      super(props, context)
      if (!context._reduxForm) {
        throw new Error(
          'QueryFields must be used inside a React tree decorated with reduxForm()'
        )
      }
      const error = validateNameProp(props.names, 'QueryFields')
      if (error) {
        throw error
      }
    }

    render() {
      const { render, children, names } = this.props
      const prefixedNames = names.map(name => prefixName(this.context, name))
      const renderProp = render || children
      invariant(renderProp, 'render or child prop is required')
      const component = compose([renderProp, removeFieldsHandlers])
      return createElement(ConnectedFields, {
        ...this.props,
        names: prefixedNames,
        _reduxForm: this.context._reduxForm,
        component
      })
    }
  }

  QueryFields.propTypes = {
    names: (props, propName) =>
      validateNameProp(props[propName], 'QueryFields'),
    children: PropTypes.func,
    render: PropTypes.func
  }
  QueryFields.contextTypes = {
    _reduxForm: PropTypes.object
  }

  polyfill(QueryFields)
  return QueryFields
}

export default createQueryFields
