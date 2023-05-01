import * as React from 'react';
import styled, { keyframes } from 'styled-components';

const Spin = keyframes`
  0% {
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    transform: rotate(360deg);
  }
`;

const Spinner = styled.li`
  -webkit-animation-duration: 0.75s;
  -moz-animation-duration: 0.75s;
  animation-duration: 0.75s;
  -webkit-animation-iteration-count: infinite;
  -moz-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
  -webkit-animation-name: ${Spin};
  -moz-animation-name: ${Spin};
  animation-name: ${Spin};
  -webkit-animation-timing-function: linear;
  -moz-animation-timing-function: linear;
  animation-timing-function: linear;
  height: 20px;
  width: 20px;
  margin-bottom: -10px;
  border: 8px solid ${({ theme }) => theme.accent};
  border-right-color: transparent;
  border-radius: 50%;
  display: inline-block;
`;

const Loading = () => <Spinner />;

export default Loading;
