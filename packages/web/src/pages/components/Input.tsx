import styled from 'styled-components';

const Input = styled.input`
  @media (max-width: 800px) {
    width: 165px;
  }
  display: flex;
  flex: 1;
  width: 95%;
  margin-bottom: 20px;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.lighter};
  color: white;
  font-size: 20px;
  border: none;
  outline: none;
  padding: 20px 20px;
  font-size: 16px;
`;

export default Input;
