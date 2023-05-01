declare module 'react-material-snackbar' {
  import * as React from 'react';

  interface SnackBarProps {
    show: boolean;
    timer?: number;
  }

  export default class SnackBar extends React.Component<SnackBarProps, any> {}
}
