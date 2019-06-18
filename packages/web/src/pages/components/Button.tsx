import styled from 'styled-components';

const Button = styled.button`
  margin-right: 40px;
  min-width: 100px;
  height: 50px;
  background-color: ${({ theme }) => theme.accent};
  color: white;
  text-align: center;
  line-height: 50px;
  border-radius: 30px;
  font-size: 16px;
  border: none;
  outline: none;
`;

export default Button;
