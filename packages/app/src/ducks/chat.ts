import { ReduxState } from '.'

// Actions
const SET_CHATTING_USER = 'chat/SET_CHATTING_USER'

interface Action {
  type: string
  payload: {
    chattingWith: string
  }
}

export interface State {
  chattingWith: string
}

const initialState: State = {
  chattingWith: '',
}

// Reducer
export default function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case SET_CHATTING_USER: {
      const { chattingWith } = action.payload
      return {
        chattingWith,
      }
    }

    default:
      return state
  }
}

// Actions
export const setChattingUser = (chattingWith: string) => ({
  type: SET_CHATTING_USER,
  payload: {
    chattingWith,
  },
})

// Selectors
export const getChattingUser = (state: ReduxState) => state.chat.chattingWith
