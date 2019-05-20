import chat, { State as ChatState } from './chat'
import { combineReducers } from 'redux'

export interface ReduxState {
  chat: ChatState
}

export default combineReducers({
  chat,
})
