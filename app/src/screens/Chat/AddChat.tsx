import * as React from 'react'
import * as Apollo from 'react-apollo-hooks'
import {
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native'
import styled from 'styled-components/native'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import { NavigationInjectedProps } from 'react-navigation'
import { GraphqlQueryControls, graphql } from 'react-apollo'
import {
  AddChatQuery_me,
  AddChatQuery_users,
  AddChatQuery_users_edges,
} from './__generated__/AddChatQuery'
import gql from 'graphql-tag'
import idx from 'idx'
import { gravatarURL } from '../../config/utils'
import AddChatMutation from './mutations/AddChatMutation'

const { width } = Dimensions.get('window')

const Wrapper = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
`

const Header = styled.View`
  width: 100%;
  flex-direction: row;
  padding: 15px;
  align-items: center;
  justify-content: space-between;
  border-bottom-width: 1px;
  border-bottom-color: #3a3f53;
`

const HeaderTitle = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 43;
  font-weight: 500;
  height: 50;
  justify-content: flex-end;
`

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`

const UserProfile = styled.Image`
  width: 45;
  height: 45;
  border-radius: 6;
`

const ButtonWrapper = styled.TouchableOpacity`
  padding: 18px 40px;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  margin: 10px 20px;
  background-color: ${({ theme }) => theme.colors.accent};
`

const ButtonText = styled.Text`
  color: white;
  font-size: 20px;
  font-family: 'Rubik';
`

const Logo = styled.Image.attrs({
  source: ({ theme }) => theme.images.logo,
})`
  width: 400;
  height: 180;
`

const AlignAtCenter = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
`

const ChatifyText = styled.Text`
  font-family: 'Rubik';
  color: white;
  font-size: 20;
  margin-top: -20;
  margin-bottom: 20;
`

const BackArrow = styled.Image.attrs({
  source: ({ theme }) => theme.images.back,
})`
  width: 13;
  height: 21;
  margin-right: 10;
`

const HeaderRow = styled.View`
  width: 100%;
  flex-direction: row;
  padding: 15px 20px;
  align-items: center;
  justify-content: space-between;
`

const Input = styled.TextInput.attrs({
  underlineColorAndroid: 'transparent',
  placeholderTextColor: ({ theme }) => theme.colors.grey,
  placeholder: 'Search for a user here...',
})`
  color: ${({ theme }) => theme.colors.grey};
  font-size: 17;
  width: 80%;
`

const SearchIcon = styled.Image.attrs({
  source: ({ theme }) => theme.images.search,
})`
  width: 21;
  height: 22;
`

const UserCard = styled.View`
  width: ${width - 30};
  margin: 10px 15px;
  height: 70;
  padding: 10px;
  border-radius: 10;
  background-color: ${({ theme }) => theme.colors.lighter};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const ProfilePicture = styled.Image`
  width: 50;
  height: 50;
  border-radius: 25;
  margin-right: 10;
`

const UserName = styled.Text`
  font-size: 18;
  font-family: 'Rubik';
  color: white;
`

const Button = styled.TouchableOpacity`
  padding: 5px 10px;
  background-color: ${({ theme }) => theme.colors.accent};
  align-items: center;
  justify-content: center;
  border-radius: 100px;
`

const AddButtonText = styled.Text`
  font-size: 12;
  font-family: 'Rubik';
  color: white;
`

interface Params {
  refetch: () => void
}

interface Data extends GraphqlQueryControls {
  me: AddChatQuery_me
  users: AddChatQuery_users
}

interface Props extends NavigationInjectedProps<Params> {
  data: Data
}

const AddChat = (props: Props) => {
  const { loading, error, me, users } = props.data
  const [search, setSearch] = React.useState('')
  const [isFetchingEnd, setFetchingEnd] = React.useState(false)
  const addChat = Apollo.useMutation(AddChatMutation)

  const searchUser = () => {
    props.data.refetch({
      search,
    })
  }

  const addNewChat = (id: string) => {
    addChat({
      variables: {
        id,
      },
      refetchQueries: ['ChatListQuery'],
    }).then(() => {
      props.navigation.goBack()
    })
  }

  const onEndReached = () => {
    if (isFetchingEnd) {
      return
    }
    setFetchingEnd(true)

    const count = (users && users.count) || 10

    const more = count + 10

    return props.data
      .fetchMore({
        variables: { first: more },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          return {
            ...previousResult,
            users: fetchMoreResult.users,
          }
        },
      })
      .then(() => setFetchingEnd(false))
  }

  const renderItem = (item: AddChatQuery_users_edges | null) => {
    const email = idx(item, _ => _.email) || ''
    const name = idx(item, _ => _.name) || ''

    const formattedNameArr = name.split(' ')

    return (
      <UserCard>
        <Row>
          <ProfilePicture source={{ uri: gravatarURL(email) }} />
          <UserName>
            {formattedNameArr.length !== 1 ? `${formattedNameArr[0]} ${formattedNameArr[1]}` : name}
          </UserName>
        </Row>
        <Button onPress={() => addNewChat((item && item._id) || '')}>
          <AddButtonText>Chat</AddButtonText>
        </Button>
      </UserCard>
    )
  }

  if (loading) {
    return (
      <AlignAtCenter>
        <ActivityIndicator animating color="white" />
      </AlignAtCenter>
    )
  }

  if (error) {
    return (
      <AlignAtCenter>
        <Logo />
        <ChatifyText>No Connection 😢</ChatifyText>
        <ButtonWrapper onPress={() => props.data.refetch()}>
          <ButtonText>Retry</ButtonText>
        </ButtonWrapper>
      </AlignAtCenter>
    )
  }

  return (
    <Wrapper>
      <StatusBar hidden={false} />
      <Header>
        <Row>
          <TouchableOpacity
            hitSlop={{ top: 20, left: 20, right: 20, bottom: 20 }}
            onPress={() => props.navigation.goBack()}
          >
            <BackArrow />
          </TouchableOpacity>
          <HeaderTitle>Add Chat</HeaderTitle>
        </Row>
        <UserProfile source={{ uri: gravatarURL(me.email || '') }} />
      </Header>
      <FlatList
        onEndReached={onEndReached}
        keyExtractor={item => idx(item, _ => _._id) || ''}
        data={(idx(users, _ => _.edges) || []).filter(element => element._id !== props.data.me._id)}
        ListFooterComponent={Platform.OS === 'ios' ? <KeyboardSpacer /> : null}
        ListHeaderComponent={
          <HeaderRow>
            <Input onChangeText={setSearch} onBlur={searchUser} value={search} />
            <TouchableOpacity onPress={searchUser}>
              <SearchIcon />
            </TouchableOpacity>
          </HeaderRow>
        }
        renderItem={({ item }) => renderItem(item)}
      />
    </Wrapper>
  )
}

const Query = gql`
  query AddChatQuery($first: Int = 10, $search: String = "") {
    me {
      _id
      email
      name
    }
    users(first: $first, search: $search) {
      count
      edges {
        _id
        name
        email
      }
    }
  }
`
// @ts-ignore
export default graphql(Query)(AddChat)
