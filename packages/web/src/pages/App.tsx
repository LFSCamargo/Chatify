import * as React from 'react';
import styledComponents from 'styled-components';

const Container = styled.div`
  display: flex;
  flex: 1;
  background-color: white;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Title = styled.h1`
  color: grey;
  font-weight: normal;
`;

const Description = styled.p`
  color: grey;
  font-size: 20px;
`;

class App extends React.Component {
  render() {
    return (
      <Container>
        <Title>Welcome to React with Typescript Boilerplate</Title>
        <Description>This is the App.tsx file</Description>
      </Container>
    );
  }
}

export default App;
