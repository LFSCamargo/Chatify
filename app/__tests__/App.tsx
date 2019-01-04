import 'jest'
import 'react-native'

import React from 'react'
import renderer from 'react-test-renderer'

import App from '../App'

it('renders correctly', () => {
  renderer.create(<App />)
})
