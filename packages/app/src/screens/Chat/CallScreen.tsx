import * as React from 'react'
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native'
import styled from 'styled-components/native';

const Wrapper = styled(SafeAreaView)`
  flex: 1;
  background-color: white;
`

interface Props {}

const CallScreen = (props: Props) => {
  return <Wrapper />

}
export default CallScreen