import React, { PureComponent } from 'react'
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'

export interface Props {}

export default class App extends PureComponent<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to React Native</Text>
        <Text style={styles.instructions}>TypeScript + Prettier configured</Text>
        <Text style={styles.instructions}>To get started, edit App.jsx</Text>
        <Text style={styles.instructions}>💙</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  } as ViewStyle,
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  } as TextStyle,
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 6,
  } as TextStyle,
})
