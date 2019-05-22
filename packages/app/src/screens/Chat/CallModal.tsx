import * as React from 'react'
import { SafeAreaView, Modal, Dimensions, Vibration } from 'react-native'
import styled from 'styled-components/native'

const { width } = Dimensions.get('window')

const Wrapper = styled(SafeAreaView)`
  flex: 1;
  background-color: black;
  align-items: center;
  justify-content: center;
`

const WrapperImageAndName = styled.View`
  width: ${width - 40};
  align-items: center;
  justify-content: center;
`

const UserProfile = styled.Image`
  width: 100;
  height: 100;
  border-radius: 10;
`

const HangupButton = styled.TouchableOpacity`
  width: 70;
  height: 70;
  border-radius: ${70 / 2};
  background-color: red;
  align-items: center;
  justify-content: center;
`

const ActionButtons = styled.TouchableOpacity`
  width: 70;
  height: 70;
  border-radius: ${70 / 2};
  background-color: green;
  align-items: center;
  justify-content: center;
`

const ButtonsContainer = styled.View`
  position: absolute;
  left: 30;
  right: 30;
  bottom: 30;
  padding: 30px;
  width: ${width - 60};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const ChatifyText = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 20;
  text-align: center;
  margin-top: 20;
  width: ${width - 80};
  margin-bottom: 20;
`
const ChatifyTextTop = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 20;
  text-align: center;
  width: ${width - 80};
  margin-bottom: 20;
`

const TextContainer = styled.View`
  position: absolute;
  top: 50;
  left: 20;
  right: 20;
  align-items: center;
  justify-content: center;
`

const CallIcon = styled.Image.attrs({
  source: props => props.theme.images.phone,
})`
  width: 30;
  height: 11;
`

const AcceptCallIcon = styled.Image.attrs({
  source: props => props.theme.images.phone,
})`
  width: 30;
  height: 11;
  transform: rotate(130deg);
`

interface Props {
  visible: boolean
  acceptCall: () => void
  rejectCall: () => void
  callingUser: string
  callingUserPic: string
}

const CallModal = (props: Props) => {
  const { visible, acceptCall, rejectCall, callingUser, callingUserPic } = props

  React.useEffect(() => {
    if (visible) {
      Vibration.vibrate([1000], true)
    } else if (!visible) {
      Vibration.cancel()
    }
  }, [visible])

  return (
    <Modal visible={visible} transparent={false} animated animationType='fade'>
      <Wrapper>
        <TextContainer>
          <ChatifyTextTop>Incoming Call</ChatifyTextTop>
        </TextContainer>
        <WrapperImageAndName>
          <UserProfile source={{ uri: callingUserPic }} />
          <ChatifyText>{callingUser}</ChatifyText>
        </WrapperImageAndName>
        <ButtonsContainer>
          <ActionButtons onPress={() => acceptCall()}>
            <AcceptCallIcon />
          </ActionButtons>
          <HangupButton onPress={() => rejectCall()}>
            <CallIcon />
          </HangupButton>
        </ButtonsContainer>
      </Wrapper>
    </Modal>
  )
}

export default CallModal
