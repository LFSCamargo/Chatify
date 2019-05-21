import { createStore, applyMiddleware } from 'redux'
import logger from 'redux-logger'

import reducers from '../ducks'

const Store = createStore(reducers, applyMiddleware(logger))

export default Store
