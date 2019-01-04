import * as React from 'react'
import { SafeAreaView } from 'react-native'
import styled from 'styled-components/native'

const Wrapper = styled(SafeAreaView)`
  flex: 1;
  backgroundcolor: ${({ theme }) => theme.colors.primary};
`

const ChatWrapper = () => {
  return <Wrapper />
}

export default ChatWrapper
