// @flow
import { PureComponent, createElement } from 'react'
import { polyfill } from 'react-lifecycles-compat'
import PropTypes from 'prop-types'
import invariant from 'invariant'
import createConnectedFields from './ConnectedFields'
import prefixName from './util/prefixName'
import type { Structure, ReactContext } from './types'
import type { Props } from './FieldsProps.types'
import removeFieldHandler from './util/removeFieldHandler'

const validateNameProp = prop => {
  if (!prop) {
    return new Error('No "names" prop was specified <QueryFields/>')
  }
  if (!Array.isArray(prop) && !prop._isFieldArray) {
    return new Error(
      'Invalid prop "names" supplied to <QueryFields/>. Must be either an array of strings or the fields array generated by FieldArray.'
    )
  }
}

const createQueryFields = (structure: Structure<*, *>) => {
  const ConnectedFields = createConnectedFields(structure)

  class QueryFields extends PureComponent<Props> {
    constructor(props: Props, context: ReactContext) {
      super(props, context)
      if (!context._reduxForm) {
        throw new Error(
          'QueryFields must be inside a component decorated with reduxForm()'
        )
      }
      const error = validateNameProp(props.names)
      if (error) {
        throw error
      }
    }

    render() {
      const { context } = this
      const { render, children } = this.props
      const names = this.props.names.map(name => prefixName(context, name))

      const component = fields => {
        const normalizedFields = fields.names.reduce(
          (acc, curr) => ({
            ...acc,
            [curr]: removeFieldHandler(fields[curr])
          }),
          {}
        )
        const renderProp = render || children
        invariant(renderProp, 'render or child prop is required')
        return renderProp(normalizedFields)
      }

      return createElement(ConnectedFields, {
        ...this.props,
        names,
        _reduxForm: this.context._reduxForm,
        component
      })
    }
  }

  QueryFields.propTypes = {
    names: (props, propName) => validateNameProp(props[propName]),
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