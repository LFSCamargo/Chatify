import * as React from 'react'
import * as Apollo from 'react-apollo-hooks'
import {
  SafeAreaView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
  AsyncStorage,
  Keyboard,
  TouchableOpacity,
} from 'react-native'
import styled from 'styled-components/native'
import { NavigationInjectedProps } from 'react-navigation'
import gql from 'graphql-tag'
import { Routes } from '../../config/Router'

const { width } = Dimensions.get('window')

const Wrapper = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
`

const Logo = styled.Image.attrs({
  source: ({ theme }) => theme.images.logo,
})`
  width: 400;
  height: 180;
`

const ChatifyText = styled.Text`
  font-family: 'Rubik';
  font-weight: bold;
  color: white;
  font-size: 43;
  margin-top: -40;
  margin-bottom: 20;
`

const Input = styled.TextInput.attrs({
  underlineColorAndroid: 'transparent',
  placeholderTextColor: 'grey',
})`
  width: ${width - 30};
  background-color: ${({ theme }) => theme.colors.lighter};
  align-items: center;
  font-size: 16;
  color: white;
  padding: 15px 20px;
  margin: 10px;
  border-radius: 100px;
`

const ButtonWrapper = styled.TouchableOpacity`
  padding: 18px 40px;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  margin: 10px 20px;
  background-color: ${({ theme }) => theme.colors.accent};
  margin-top: 20;
`

const ButtonText = styled.Text`
  color: white;
  font-size: 20px;
  font-family: 'Rubik';
`

const BackArrow = styled.Image.attrs({
  source: ({ theme }) => theme.images.back,
})`
  width: 13;
  height: 21;
`

const Header = styled.View`
  width: 100%;
  flex-direction: row;
`

const BackWrapper = styled.TouchableOpacity`
  margin-left: 20;
  margin-top: 20;
  z-index: 1000;
`

const KeyboardWrapper = styled.KeyboardAvoidingView.attrs({
  enabled: true,
  behavior: Platform.OS === 'ios' ? 'padding' : 'height',
})`
  flex: 1;
`

const LOGIN = gql`
  mutation register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) {
      token
    }
  }
`

interface Props extends NavigationInjectedProps {}

const SignUp = (props: Props) => {
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const registerUser = Apollo.useMutation(LOGIN)

  const register = async () => {
    if (loading) return

    setLoading(true)
    Keyboard.dismiss()

    if (!email || !password || !name) {
      setLoading(false)
      return Alert.alert('Error', 'Please fill all the fields to continue')
    }

    try {
      const res = await registerUser({
        variables: {
          email,
          password,
          name,
        },
      })

      const token = res.data && res.data.register && res.data.register.token

      setLoading(false)

      await AsyncStorage.setItem('token', token)

      return props.navigation.navigate(Routes.Logged)
    } catch (err) {
      setLoading(false)

      const errorMessage = err.message.replace('GraphQL error: ', '')

      return Alert.alert('Error', errorMessage)
    }
  }

  return (
    <KeyboardWrapper>
      <Wrapper>
        <Header>
          <BackWrapper onPress={() => props.navigation.goBack()}>
            <BackArrow />
          </BackWrapper>
        </Header>
        <Logo />
        <ChatifyText>Chatify</ChatifyText>
        <Input value={name} onChangeText={setName} placeholder="Full Name" autoCapitalize="none" />
        <Input value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" />
        <Input
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
        />
        <ButtonWrapper onPress={register}>
          {loading && <ActivityIndicator animating color="white" />}
          {!loading && <ButtonText>Sign Up</ButtonText>}
        </ButtonWrapper>
      </Wrapper>
    </KeyboardWrapper>
  )
}

export default SignUp
